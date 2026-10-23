import test from 'node:test';
import assert from 'node:assert/strict';

// Opt-in: use the configured engine, but shadow every touched table with a
// session-local copy. No real rows, sequences, balances or receipts are changed.
test('avatar purchases against real PostgreSQL in temporary tables', { skip: process.env.AVATAR_POSTGRES_TEST !== '1' }, async t => {
  const { default: BD } = await import('../src/db/BD.js');
  const { default: inventoryController } = await import('../src/controllers/InventarioAvatarController.js');
  const { default: express } = await import('express');
  const { default: wardrobe } = await import('../src/configs/avatar-wardrobe.json', { with: { type: 'json' } });
  const client = await BD.pool.connect();
  let server;
  try {
    await client.query('BEGIN');
    for (const table of ['avatares', 'items_avatares', 'saldos_puntos', 'inventarios_avatares']) {
      await client.query(`CREATE TEMP TABLE ${table} (LIKE public.${table} INCLUDING DEFAULTS INCLUDING INDEXES) ON COMMIT DROP`);
      await client.query(`ALTER TABLE pg_temp.${table} ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY`);
    }
    await client.query('SET LOCAL search_path TO pg_temp,public');
    for (const table of ['avatares', 'items_avatares', 'saldos_puntos', 'inventarios_avatares']) {
      const { rows: [row] } = await client.query('SELECT to_regclass($1)=to_regclass($2) AS isolated', [table, `pg_temp.${table}`]);
      assert.equal(row.isolated, true);
    }
    t.mock.method(BD, 'transaction', async callback => {
      await client.query('SAVEPOINT purchase');
      try {
        const result = await callback(client);
        await client.query('RELEASE SAVEPOINT purchase');
        return result;
      } catch (error) {
        await client.query('ROLLBACK TO SAVEPOINT purchase');
        await client.query('RELEASE SAVEPOINT purchase');
        throw error;
      }
    });
    await client.query('INSERT INTO avatares (id_perteneciente) VALUES (1),(2)');
    await client.query('INSERT INTO saldos_puntos (id_perteneciente,saldo) VALUES (1,200),(2,0)');
    for (const code of ['top:tee-black', 'hairstyle:bun']) {
      const item = wardrobe.find(item => item.id === code);
      await client.query('INSERT INTO items_avatares (id_tipo_item_avatar,nombre,codigo_item_externo,precio_punto,activo) VALUES (1,$1,$2,$3,true)', [item.name, item.id, item.price]);
    }
    // Actual controller + actual SQL; authentication/ownership are covered by
    // the separate authorization suites, not bypassed in the application.
    const app = express();
    app.use(express.json());
    app.use('/api/inventarios-avatares', inventoryController);
    server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    const request = (item, avatar = 1) => fetch(`http://127.0.0.1:${server.address().port}/api/inventarios-avatares`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_avatar: avatar, id_item_avatar: item, fecha_obtencion: new Date(), precio_punto: 0 }),
    });
    const balance = async id => (await client.query('SELECT saldo FROM saldos_puntos WHERE id_perteneciente=$1', [id])).rows[0].saldo;
    await t.test('garment and hairstyle debit the server prices and retain receipts', async () => {
      const garment = await request(1);
      assert.equal(garment.status, 201);
      assert.ok((await garment.json()).id);
      assert.equal(await balance(1), 130);
      const hairstyle = await request(2);
      assert.equal(hairstyle.status, 201);
      assert.ok((await hairstyle.json()).id);
      assert.equal(await balance(1), 30);
      const { rows } = await client.query('SELECT id_item_avatar FROM inventarios_avatares WHERE id_avatar=1 ORDER BY id_item_avatar');
      assert.deepEqual(rows.map(row => row.id_item_avatar), [1, 2]);
    });
    await t.test('repurchase never debits twice', async () => {
      assert.equal((await request(1)).status, 409);
      assert.equal(await balance(1), 30);
    });
    await t.test('insufficient funds cannot acquire items or produce negative balances', async () => {
      const response = await request(1, 2);
      assert.equal(response.status, 409);
      assert.match((await response.json()).message, /Saldo insuficiente/);
      assert.equal(await balance(2), 0);
      assert.equal((await client.query('SELECT * FROM inventarios_avatares WHERE id_avatar=2')).rowCount, 0);
    });
    await t.test('inventory write failure rolls back the debit', async () => {
      await client.query('UPDATE saldos_puntos SET saldo=200 WHERE id_perteneciente=2');
      await client.query('ALTER TABLE pg_temp.inventarios_avatares ADD CONSTRAINT synthetic_failure CHECK (id_avatar<>2)');
      const response = await request(1, 2);
      assert.equal(response.status, 500);
      assert.equal((await response.json()).message, 'No pudimos completar la compra. Intenta nuevamente.');
      assert.equal(await balance(2), 200);
      assert.equal((await client.query('SELECT * FROM inventarios_avatares WHERE id_avatar=2')).rowCount, 0);
    });
  } finally {
    if (server) await new Promise(resolve => server.close(resolve));
    await client.query('ROLLBACK');
    client.release();
    await BD.pool.end();
  }
});
