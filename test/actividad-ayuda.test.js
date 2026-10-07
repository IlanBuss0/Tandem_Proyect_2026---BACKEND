import test from 'node:test';
import assert from 'node:assert/strict';
import ActividadAsignadaService from '../src/services/ActividadAsignadaService.js';
import AuthorizationService from '../src/services/AuthorizationService.js';
import { cacheService } from '../src/services/CacheService.js';

const asignada = { id: 9, id_actividad: 3, id_actividad_personalizada: null, id_perteneciente: 5 };

function setup({ tutores = [{ id_usuario: 20, nombre: 'Laura Gomez' }], context = { perteneciente: { id: 5 } } } = {}) {
  const calls = { notifications: [], events: [], tutorQueries: [] };
  const store = new Map();
  AuthorizationService.getUserContext = async () => context;
  cacheService.get = async (key) => store.get(key) ?? null;
  cacheService.set = async (key, value) => { store.set(key, value); };

  const service = new ActividadAsignadaService();
  service.ActividadAsignadaRepository = { getByIdAsync: async (id) => (Number(id) === 9 ? asignada : null) };
  service.VinculoTutorPertenecienteRepository = {
    getActiveTutorUsersAsync: async (idPerteneciente) => { calls.tutorQueries.push(idPerteneciente); return tutores; },
  };
  service.ActividadRepository = { getByIdAsync: async () => ({ titulo: 'Lavarse los dientes' }) };
  service.ActividadPersonalizadaRepository = { getByIdAsync: async () => ({ titulo: 'Personalizada' }) };
  service.UsuarioRepository = { getByIdAsync: async () => ({ nombre: 'Mateo Perez' }) };
  service.NotificationProducerService = {
    createAsync: async (n) => { calls.notifications.push(n); return calls.notifications.length; },
  };
  service.UsageEventService = { logAsync: async (e) => { calls.events.push(e); return 1; } };
  return { service, calls };
}

const body = { motivo: 'no_entiende', paso: 2, totalPasos: 5, pasoTexto: 'Poné pasta en el cepillo' };

test('requestHelpAsync avisa a los tutores activos con el texto correcto y registra el evento', async () => {
  const { service, calls } = setup();
  const result = await service.requestHelpAsync(9, 7, body);
  assert.deepEqual(result, { avisados: ['Laura'], repetido: false });
  assert.deepEqual(calls.tutorQueries, [5]);
  assert.equal(calls.notifications.length, 1);
  const n = calls.notifications[0];
  assert.equal(n.recipientUserId, 20);
  assert.equal(n.typeName, 'Alerta');
  assert.equal(n.referenceType, 'activity_help:no_entiende');
  assert.equal(n.referenceId, 9);
  assert.equal(n.actorUserId, 7);
  assert.equal(n.contextUserId, 7);
  assert.equal(n.title, 'Mateo no entiende un paso');
  assert.equal(n.body, 'En «Lavarse los dientes», paso 2 de 5: Poné pasta en el cepillo');
  assert.equal(calls.events[0].tipoEvento, 'ayuda_pedida');
  assert.deepEqual(calls.events[0].valor, { motivo: 'no_entiende', paso: 2, avisados: 1, titulo: 'Lavarse los dientes', pasoTexto: 'Poné pasta en el cepillo' });
});

test('requestHelpAsync arma los textos sin totalPasos / pasoTexto y para pausa', async () => {
  const { service, calls } = setup();
  await service.requestHelpAsync(9, 7, { motivo: 'ayuda', paso: 3 });
  await service.requestHelpAsync(9, 7, { motivo: 'pausa', paso: 3, totalPasos: 4 });
  assert.equal(calls.notifications[0].title, 'Mateo pidió ayuda');
  assert.equal(calls.notifications[0].body, 'En «Lavarse los dientes», paso 3.');
  assert.equal(calls.notifications[1].title, 'Mateo se está tomando una pausa');
  assert.equal(calls.notifications[1].body, 'Estaba en «Lavarse los dientes», paso 3 de 4. Quiso que lo sepas.');
});

test('requestHelpAsync limpia y corta pasoTexto a 200 caracteres', async () => {
  const { service, calls } = setup();
  await service.requestHelpAsync(9, 7, { motivo: 'ayuda', paso: 1, pasoTexto: `  hola\u0000\u0007 ${'x'.repeat(300)}` });
  const text = calls.notifications[0].body.split(': ')[1];
  assert.ok(text.length <= 200);
  assert.ok(text.startsWith('hola'));
  assert.ok(!/[\u0000-\u001F]/.test(text));
});

test('requestHelpAsync sin tutores activos devuelve avisados vacio', async () => {
  const { service, calls } = setup({ tutores: [] });
  assert.deepEqual(await service.requestHelpAsync(9, 7, body), { avisados: [], repetido: false });
  assert.equal(calls.notifications.length, 0);
});

test('requestHelpAsync rechaza a quien no es el perteneciente (tutor) con 403 y actividad inexistente con 404', async () => {
  const { service, calls } = setup({ context: { tutor: { id: 1 }, perteneciente: null } });
  await assert.rejects(() => service.requestHelpAsync(9, 20, body), (e) => e.statusCode === 403);
  const otro = setup({ context: { perteneciente: { id: 99 } } });
  await assert.rejects(() => otro.service.requestHelpAsync(9, 8, body), (e) => e.statusCode === 403);
  const ok = setup();
  await assert.rejects(() => ok.service.requestHelpAsync(404, 7, body), (e) => e.statusCode === 404);
  assert.equal(calls.notifications.length, 0);
});

test('requestHelpAsync valida motivo, paso, totalPasos e id con 400', async () => {
  const { service } = setup();
  const bad = [
    { ...body, motivo: 'crisis' },
    { ...body, motivo: undefined },
    { ...body, paso: 0 },
    { ...body, paso: 'abc' },
    { ...body, paso: 1.5 },
    { ...body, paso: undefined },
    { ...body, paso: 4, totalPasos: 3 },
  ];
  for (const b of bad) await assert.rejects(() => service.requestHelpAsync(9, 7, b), (e) => e.statusCode === 400);
  await assert.rejects(() => service.requestHelpAsync('x', 7, body), (e) => e.statusCode === 400);
  await assert.rejects(() => service.requestHelpAsync(0, 7, body), (e) => e.statusCode === 400);
});

test('requestHelpAsync: el segundo pedido igual dentro de 60 s es repetido y no notifica', async () => {
  const { service, calls } = setup();
  await service.requestHelpAsync(9, 7, body);
  const second = await service.requestHelpAsync(9, 7, body);
  assert.deepEqual(second, { avisados: ['Laura'], repetido: true });
  assert.equal(calls.notifications.length, 1);
  assert.equal(calls.events.length, 1);
  const otroMotivo = await service.requestHelpAsync(9, 7, { ...body, motivo: 'ayuda' });
  assert.equal(otroMotivo.repetido, false);
});

test('requestHelpAsync no se rompe si el registro de uso falla', async () => {
  const { service } = setup();
  service.UsageEventService = { logAsync: async () => { throw new Error('boom'); } };
  assert.deepEqual(await service.requestHelpAsync(9, 7, body), { avisados: ['Laura'], repetido: false });
});

test('requestHelpAsync: si no se avisó a nadie no cachea y un segundo pedido vuelve a intentar', async () => {
  const { service, calls } = setup({ tutores: [] });
  assert.deepEqual(await service.requestHelpAsync(9, 7, body), { avisados: [], repetido: false });
  assert.deepEqual(await service.requestHelpAsync(9, 7, body), { avisados: [], repetido: false });
  assert.equal(calls.tutorQueries.length, 2);

  const fails = setup();
  fails.service.NotificationProducerService = { createAsync: async () => 0 };
  assert.equal((await fails.service.requestHelpAsync(9, 7, body)).repetido, false);
  assert.equal((await fails.service.requestHelpAsync(9, 7, body)).repetido, false);
  assert.equal(fails.calls.tutorQueries.length, 2);
});
