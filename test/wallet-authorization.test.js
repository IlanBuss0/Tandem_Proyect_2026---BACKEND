import test from 'node:test';
import assert from 'node:assert/strict';
import BD from '../src/db/BD.js';
import InventarioAvatarService from '../src/services/InventarioAvatarService.js';
import ActividadAsignadaRepository from '../src/repositories/ActividadAsignadaRepository.js';

const purchase = { id_avatar: 1, id_item_avatar: 2, fecha_obtencion: '2026-01-01', precio_punto: 0, equipado: false };

test('purchase uses the server price and cannot acquire an item without balance', async t => {
  let inserts = 0;
  t.mock.method(BD, 'transaction', async callback => callback({ query: async (sql, values) => {
    if (sql.includes('FROM avatares')) return { rows: [{ id: 1, id_perteneciente: 1 }] };
    if (sql.includes('FROM items_avatares')) return { rows: [{ id: 2, activo: true, precio_punto: 75 }] };
    if (sql.includes('FROM inventarios_avatares')) return { rows: [] };
    if (sql.startsWith('INSERT INTO saldos')) return { rows: [] };
    if (sql.startsWith('UPDATE saldos')) { assert.equal(values[1], 75); return { rowCount: 0 }; }
    inserts++; throw new Error('Inventory insert must not be reached');
  } }));
  await assert.rejects(() => new InventarioAvatarService().createAsync(purchase), { statusCode: 409 });
  assert.equal(inserts, 0);
});

test('purchase locks the avatar, debits once and inserts in one transaction', async t => {
  const commands = [];
  t.mock.method(BD, 'transaction', async callback => callback({ query: async sql => {
    commands.push(sql);
    if (sql.includes('FROM avatares')) return { rows: [{ id: 1, id_perteneciente: 1 }] };
    if (sql.includes('FROM items_avatares')) return { rows: [{ id: 2, activo: true, precio_punto: 75 }] };
    if (sql.includes('FROM inventarios_avatares')) return { rows: [] };
    if (sql.startsWith('INSERT INTO saldos')) return { rows: [] };
    if (sql.startsWith('UPDATE saldos')) return { rowCount: 1 };
    if (sql.startsWith('INSERT INTO inventarios')) return { rows: [{ id: 3 }] };
    throw new Error('Unexpected query');
  } }));
  assert.equal(await new InventarioAvatarService().createAsync(purchase), 3);
  assert.match(commands[0], /FOR UPDATE/);
  assert.equal(commands.filter(sql => sql.startsWith('UPDATE saldos')).length, 1);
});

test('an already-owned item cannot debit the wallet again', async t => {
  t.mock.method(BD, 'transaction', async callback => callback({ query: async sql => {
    if (sql.includes('FROM avatares')) return { rows: [{ id: 1, id_perteneciente: 1 }] };
    if (sql.includes('FROM items_avatares')) return { rows: [{ id: 2, activo: true, precio_punto: 75 }] };
    if (sql.includes('FROM inventarios_avatares')) return { rows: [{ id: 3 }] };
    assert.fail('Must not debit or insert');
  } }));
  await assert.rejects(() => new InventarioAvatarService().createAsync(purchase), { statusCode: 409 });
});

for (const scenario of [
  { label: 'first completion assigned by another user', completed: false, assigner: 2, reward: true },
  { label: 'repeated completion', completed: true, assigner: 2, reward: false },
  { label: 'self-assigned completion', completed: false, assigner: 1, reward: false },
]) {
  test(`reward authorization: ${scenario.label}`, async t => {
    let credited = 0;
    t.mock.method(BD, 'transaction', async callback => callback({ query: async (sql, values) => {
      if (sql.includes('FOR UPDATE OF aa')) return { rows: [{ id: 1, id_perteneciente: 1, id_usuario: 1, id_usuario_asignador: scenario.assigner, fecha_completada: scenario.completed ? new Date() : null, reward_level: 5 }] };
      if (sql.includes('UPDATE actividades_asignadas')) return { rows: [{ id: 1 }] };
      if (sql.startsWith('INSERT INTO saldos')) { credited++; assert.equal(values[1], 25); return { rows: [] }; }
      assert.fail('Unexpected query');
    } }));
    await new ActividadAsignadaRepository().completeAsync(1, 100);
    assert.equal(credited, scenario.reward ? 1 : 0);
  });
}
