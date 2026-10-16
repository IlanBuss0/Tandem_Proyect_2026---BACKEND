import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

test('authorization against disposable PostgreSQL', { skip: !process.env.TEST_DATABASE_URL }, async t => {
  const target = new URL(process.env.TEST_DATABASE_URL);
  assert.ok(['127.0.0.1', 'localhost', '[::1]'].includes(target.hostname) && target.pathname.endsWith('_test'));
  const { default: BD } = await import('../src/db/BD.js');
  assert.equal(new URL(BD.pool.options.connectionString).href, target.href);
  const { default: app } = await import('../src/server.js');
  const { signJwt } = await import('../src/modules/security/jwt.helper.js');
  const { hashRefreshToken } = await import('../src/modules/security/refresh-token.helper.js');
  const { default: RefreshTokenRepository } = await import('../src/repositories/RefreshTokenRepository.js');
  const { default: InventarioAvatarService } = await import('../src/services/InventarioAvatarService.js');
  const { default: ActividadAsignadaRepository } = await import('../src/repositories/ActividadAsignadaRepository.js');
  const ids = [910001, 910002, 910003, 910004, 910005];
  const [a, b, tutor, professional, admin] = ids;
  assert.equal((await BD.query('SELECT id FROM usuarios WHERE id=ANY($1::int[])', [ids])).length, 0, 'fixture IDs must be unused');
  const cookies = new Map();
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(async () => {
    await new Promise(resolve => server.close(resolve));
    await BD.transaction(async client => {
      for (const [table, column] of [
        ['inventarios_avatares', 'id_avatar'], ['saldos_puntos', 'id_perteneciente'],
        ['actividades_asignadas', 'id'], ['actividades', 'id'], ['archivos', 'id'],
        ['permisos_otorgados_profesionales', 'id_vinculo_profesional_perteneciente'],
        ['vinculos_profesional_pertenecientes', 'id'], ['vinculos_tutor_pertenecientes', 'id'],
        ['avatares', 'id'], ['items_avatares', 'id'], ['refresh_tokens', 'id_usuario'],
        ['pertenecientes', 'id'], ['tutores', 'id'], ['profesionales', 'id'], ['usuarios', 'id'],
      ]) await client.query(`DELETE FROM ${table} WHERE ${column}=ANY($1::int[])`, [ids]);
    });
    await BD.pool.end();
  });
  const insert = async (table, row, db = BD) => {
    const keys = Object.keys(row);
    await db.query(`INSERT INTO ${table} (${keys.join(',')}) OVERRIDING SYSTEM VALUE VALUES (${keys.map((_, i) => `$${i + 1}`).join(',')})`, Object.values(row));
  };
  const first = async (table, where = 'true') => {
    const row = await BD.queryOne(`SELECT id FROM ${table} WHERE ${where} ORDER BY id LIMIT 1`);
    assert.ok(row, `catalog fixture required: ${table}`);
    return row.id;
  };
  const support = await first('niveles_apoyos');
  const autonomy = await first('autonomias_operativas');
  const active = await first('estados_vinculos', "LOWER(nombre)='activo'");
  const verified = await first('estados_validaciones_profesionales', "LOWER(nombre) IN ('verified','validado','aprobado','verificado')");
  const itemType = await first('tipos_items_avatares');
  const activityType = await first('tipos_actividades');
  const rewardLevel = await first('puntos_otorgados');
  const activityState = await first('estados_actividades');
  const fileType = await first('tipos_archivos');
  const historyPermission = await first('catalogo_permisos_profesionales', "LOWER(nombre)='verhistorial'");
  await BD.transaction(async client => {
    for (const [id, role] of [[a, 1], [b, 1], [tutor, 2], [professional, 3], [admin, 4]]) {
      await insert('usuarios', { id, id_tipo_usuario: role, nombre_usuario: `authorization_fixture_${id}`, contrasena_hash: 'fixture-not-used-for-login', nombre: 'Synthetic', apellido: String(id), correo: `fixture${id}@example.invalid`, fecha_ingreso: '2026-01-01', activo: true, email_verificado: true }, client);
    }
    for (const id of [a, b]) {
      await insert('pertenecientes', { id, id_usuario: id, id_nivel_apoyo: support, id_autonomia_operativa: autonomy, puede_autogestionarse: true }, client);
      await insert('avatares', { id, id_perteneciente: id }, client);
      await insert('archivos', { id, id_usuario_creador: id, id_tipo_archivo: fileType, nombre_archivo: `fixture${id}.pdf`, url: `https://example.invalid/fixture${id}.pdf`, fecha_subida: new Date() }, client);
    }
    await insert('tutores', { id: tutor, id_usuario: tutor }, client);
    await insert('profesionales', { id: professional, id_usuario: professional, profesion: 'Synthetic', matricula: 'fixture-authorization', id_estado_validacion: verified }, client);
    await insert('vinculos_tutor_pertenecientes', { id: a, id_tutor: tutor, id_perteneciente: a, es_tutor_principal: true, id_estado_vinculo: active, fecha_alta: '2026-01-01' }, client);
    await insert('vinculos_profesional_pertenecientes', { id: a, id_profesional: professional, id_perteneciente: a, id_estado_vinculo: active, requiere_aprobacion_tutor: false, fue_aprobado_por_tutor: false, fecha_solicitud: '2026-01-01' }, client);
    await insert('saldos_puntos', { id: a, id_perteneciente: a, saldo: 100 }, client);
    for (const [id, price] of [[a, 75], [b, 20], [tutor, 20]]) await insert('items_avatares', { id, id_tipo_item_avatar: itemType, nombre: `Fixture ${id}`, codigo_item_externo: `fixture-${id}`, precio_punto: price, activo: true }, client);
    await insert('actividades', { id: a, id_tipo_actividad: activityType, id_punto_otorgado: rewardLevel, titulo: 'Synthetic activity' }, client);
    for (const [id, patient, assigner] of [[a, a, tutor], [b, b, tutor], [tutor, a, a]]) await insert('actividades_asignadas', { id, id_actividad: a, id_perteneciente: patient, id_usuario_asignador: assigner, id_estado_actividad: activityState, fecha_asignacion: '2026-01-01' }, client);
  });
  for (const id of ids) {
    const familyId = crypto.randomUUID();
    const refresh = crypto.randomBytes(32).toString('hex');
    await RefreshTokenRepository.create({ idUsuario: id, tokenHash: hashRefreshToken(refresh), familyId, expiresAt: new Date(Date.now() + 3600000) });
    cookies.set(id, `tandem_access_token=${signJwt({ id, sid: familyId })}; tandem_refresh_token=${refresh}; tandem_csrf_token=fixture-csrf`);
  }
  const request = (path, user = a, method = 'GET', body) => fetch(`http://127.0.0.1:${server.address().port}${path}`, {
    method, headers: { Cookie: cookies.get(user), 'Content-Type': 'application/json', 'X-CSRF-Token': 'fixture-csrf' },
    ...(body ? { body: JSON.stringify(body) } : {}), redirect: 'manual',
  });
  await t.test('real ownership filters lists and rejects foreign reads, changes and deletion', async () => {
    assert.equal((await request(`/api/archivos/${a}`)).status, 200);
    const list = await (await request('/api/archivos')).json();
    assert.deepEqual(list.map(row => row.id), [a]);
    for (const role of [a, tutor, professional]) {
      for (const method of ['GET', 'PUT', 'DELETE']) assert.equal((await request(`/api/archivos/${b}`, role, method, method === 'PUT' ? { id_usuario_creador: role } : undefined)).status, 403);
      assert.equal((await request(`/api/avatares/${b}`, role)).status, 403);
      assert.equal((await request(`/api/actividades-asignadas/${b}/completar`, role, 'POST', {})).status, 403);
    }
    assert.ok(await BD.queryOne('SELECT id FROM archivos WHERE id=$1', [b]));
  });
  await t.test('owner edits cannot change the file owner or storage location', async () => {
    assert.equal((await request(`/api/archivos/${a}`, a, 'PUT', { nombre_archivo: 'renamed.pdf', id_usuario_creador: b, url: 'https://example.invalid/other.pdf' })).status, 200);
    const file = await BD.queryOne('SELECT * FROM archivos WHERE id=$1', [a]);
    assert.equal(file.id_usuario_creador, a);
    assert.equal(file.url, `https://example.invalid/fixture${a}.pdf`);
    assert.equal(file.nombre_archivo, 'renamed.pdf');
  });
  await t.test('forged grants, attachment associations, family links and balances are denied', async () => {
    for (const resource of ['permisos-archivos', 'mensajes-archivos', 'vinculos-tutor-pertenecientes', 'saldos-puntos', 'movimientos-puntos']) assert.equal((await request(`/api/${resource}`, a, 'POST', { id_perteneciente: b, id_usuario_creador: a })).status, 403);
    assert.equal((await request('/api/tipos-usuarios/1', a, 'PUT', { nombre: 'forged' })).status, 403);
  });
  await t.test('tutor and professional reads stop immediately after link or permission revocation', async () => {
    assert.equal((await request(`/api/avatares/${a}`, tutor)).status, 200);
    assert.equal((await request(`/api/avatares/${a}`, professional)).status, 200);
    await BD.execute('UPDATE vinculos_tutor_pertenecientes SET fecha_fin=CURRENT_DATE WHERE id=$1', [a]);
    assert.equal((await request(`/api/avatares/${a}`, tutor)).status, 403);
    await insert('permisos_otorgados_profesionales', { id: a, id_vinculo_profesional_perteneciente: a, id_permiso_profesional: historyPermission, habilitado: false, id_usuario_modificador: tutor, fecha_modificacion: new Date() });
    assert.equal((await request(`/api/avatares/${a}`, professional)).status, 403);
    const context = await (await request('/api/permisos/contexto', professional)).json();
    assert.deepEqual(context.data.vinculos, []);
  });
  const buy = id => new InventarioAvatarService().createAsync({ id_avatar: a, id_item_avatar: id, fecha_obtencion: new Date() });
  await t.test('ten simultaneous purchases create one inventory row and debit exactly once', async () => {
    const attempts = await Promise.allSettled(Array.from({ length: 10 }, () => buy(a)));
    assert.equal(attempts.filter(result => result.status === 'fulfilled').length, 1);
    assert.ok(attempts.filter(result => result.status === 'rejected').every(result => result.reason.statusCode === 409));
    assert.equal((await BD.queryOne('SELECT saldo FROM saldos_puntos WHERE id_perteneciente=$1', [a])).saldo, 25);
    assert.equal(Number((await BD.queryOne('SELECT COUNT(*) AS total FROM inventarios_avatares WHERE id_avatar=$1 AND id_item_avatar=$2', [a, a])).total), 1);
  });
  await t.test('simultaneous purchases of different items cannot overspend the same balance', async () => {
    const attempts = await Promise.allSettled([buy(b), buy(tutor)]);
    assert.equal(attempts.filter(result => result.status === 'fulfilled').length, 1);
    assert.equal((await BD.queryOne('SELECT saldo FROM saldos_puntos WHERE id_perteneciente=$1', [a])).saldo, 5);
  });
  await t.test('ten simultaneous completions credit one server-calculated reward', async () => {
    await Promise.all(Array.from({ length: 10 }, () => new ActividadAsignadaRepository().completeAsync(a, 100)));
    const reward = Math.min(100, Math.max(10, rewardLevel * 5));
    assert.equal((await BD.queryOne('SELECT saldo FROM saldos_puntos WHERE id_perteneciente=$1', [a])).saldo, 5 + reward);
    await new ActividadAsignadaRepository().completeAsync(tutor, 100);
    assert.equal((await BD.queryOne('SELECT saldo FROM saldos_puntos WHERE id_perteneciente=$1', [a])).saldo, 5 + reward, 'self assignment cannot mint points');
  });
  await t.test('logout revokes the actual session family and denies the old access cookie', async () => {
    assert.equal((await request('/api/auth/me')).status, 200);
    assert.equal((await request('/api/auth/logout', a, 'POST')).status, 200);
    assert.equal((await request('/api/auth/me')).status, 401);
    assert.equal((await request(`/api/archivos/${a}`)).status, 401);
  });
});
