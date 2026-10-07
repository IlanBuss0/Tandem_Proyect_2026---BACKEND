import test from 'node:test';
import assert from 'node:assert/strict';
import AyudaService from '../src/services/AyudaService.js';
import AuthorizationService from '../src/services/AuthorizationService.js';
import { cacheService } from '../src/services/CacheService.js';
import { buildHelpSpotsReport } from '../src/modules/usage/help-spots.js';

function setup({ tutores = [{ id_usuario: 20, nombre: 'Laura Gomez' }], context = { perteneciente: { id: 5 } } } = {}) {
  const calls = { notifications: [], events: [], tutorQueries: [] };
  const store = new Map();
  AuthorizationService.getUserContext = async () => context;
  cacheService.get = async (key) => store.get(key) ?? null;
  cacheService.set = async (key, value) => { store.set(key, value); };

  const service = new AyudaService();
  service.UsuarioRepository = { getByIdAsync: async () => ({ nombre: 'Mateo Perez' }) };
  service.HelpAlertService.VinculoTutorPertenecienteRepository = {
    getActiveTutorUsersAsync: async (idPerteneciente) => { calls.tutorQueries.push(idPerteneciente); return tutores; },
  };
  service.HelpAlertService.NotificationProducerService = {
    createAsync: async (n) => { calls.notifications.push(n); return calls.notifications.length; },
  };
  service.HelpAlertService.UsageEventService = { logAsync: async (e) => { calls.events.push(e); return 1; } };
  return { service, calls };
}

const rutina = { contexto: 'rutina', motivo: 'no_entiende', titulo: 'Lavarse los dientes', paso: 2, totalPasos: 5, pasoTexto: 'Poné pasta en el cepillo' };
const status = (code) => (error) => error.statusCode === code;

test('rutina: textos de ayuda, no_entiende y pausa, y notificación a los tutores activos', async () => {
  const { service, calls } = setup();
  const result = await service.requestAsync(7, rutina);
  assert.deepEqual(result, { avisados: ['Laura'], repetido: false });
  assert.deepEqual(calls.tutorQueries, [5]);
  const n = calls.notifications[0];
  assert.equal(n.recipientUserId, 20);
  assert.equal(n.typeName, 'Alerta');
  assert.equal(n.referenceType, 'activity_help:no_entiende');
  assert.equal(n.referenceId, null);
  assert.equal(n.actorUserId, 7);
  assert.equal(n.contextUserId, 7);
  assert.equal(n.title, 'Mateo no entiende un paso');
  assert.equal(n.body, 'En «Lavarse los dientes», paso 2 de 5: Poné pasta en el cepillo');

  await service.requestAsync(7, { ...rutina, motivo: 'ayuda' });
  assert.equal(calls.notifications[1].title, 'Mateo pidió ayuda');
  assert.equal(calls.notifications[1].referenceType, 'activity_help:ayuda');
  assert.equal(calls.notifications[1].body, 'En «Lavarse los dientes», paso 2 de 5: Poné pasta en el cepillo');

  await service.requestAsync(7, { ...rutina, motivo: 'pausa' });
  assert.equal(calls.notifications[2].title, 'Mateo se está tomando una pausa');
  assert.equal(calls.notifications[2].body, 'Estaba en «Lavarse los dientes», paso 2 de 5. Quiso que lo sepas.');
});

test('rutina: sin totalPasos o sin pasoTexto los textos se ajustan', async () => {
  const { service, calls } = setup();
  await service.requestAsync(7, { contexto: 'rutina', motivo: 'ayuda', titulo: 'Mi mañana', paso: 3 });
  assert.equal(calls.notifications[0].body, 'En «Mi mañana», paso 3.');
  await service.requestAsync(7, { contexto: 'rutina', motivo: 'ayuda', titulo: 'Mi mañana', paso: 4, totalPasos: 4, pasoTexto: '   ' });
  assert.equal(calls.notifications[1].body, 'En «Mi mañana», paso 4 de 4.');
});

test('comunicador: textos de ayuda y de pausa con y sin frase', async () => {
  const { service, calls } = setup();
  await service.requestAsync(7, { contexto: 'comunicador', motivo: 'ayuda' });
  assert.equal(calls.notifications[0].title, 'Mateo pidió ayuda');
  assert.equal(calls.notifications[0].body, 'Lo pidió desde «No puedo hablar».');
  assert.equal(calls.notifications[0].referenceType, 'activity_help:ayuda');
  assert.equal(calls.notifications[0].referenceId, null);

  await service.requestAsync(7, { contexto: 'comunicador', motivo: 'pausa', frase: 'Quiero estar solo' });
  assert.equal(calls.notifications[1].title, 'Mateo se está tomando una pausa');
  assert.equal(calls.notifications[1].body, 'Eligió «Quiero estar solo» en «No puedo hablar». Quiso que lo sepas.');

  const other = setup();
  await other.service.requestAsync(7, { contexto: 'comunicador', motivo: 'pausa' });
  assert.equal(other.calls.notifications[0].body, 'Eligió «Necesito espacio» en «No puedo hablar». Quiso que lo sepas.');
});

test('403 si lo pide alguien que no es perteneciente (tutor, profesional o usuario inexistente)', async () => {
  for (const context of [{ tutor: { id: 1 }, perteneciente: null }, { profesional: { id: 2 } }, null]) {
    const { service, calls } = setup({ context });
    await assert.rejects(() => service.requestAsync(20, rutina), status(403));
    await assert.rejects(() => service.requestAsync(20, { contexto: 'comunicador', motivo: 'ayuda' }), status(403));
    assert.equal(calls.notifications.length, 0);
  }
});

test('400: contexto o motivo inválido, comunicador con no_entiende, rutina sin título o sin paso, totalPasos < paso', async () => {
  const { service, calls } = setup();
  const bad = [
    undefined,
    {},
    { ...rutina, contexto: 'actividad' },
    { ...rutina, motivo: 'crisis' },
    { ...rutina, motivo: undefined },
    { contexto: 'comunicador', motivo: 'no_entiende' },
    { ...rutina, titulo: undefined },
    { ...rutina, titulo: '   ' },
    { ...rutina, titulo: 123 },
    { ...rutina, paso: undefined },
    { ...rutina, paso: 0 },
    { ...rutina, paso: 'abc' },
    { ...rutina, paso: 1.5 },
    { ...rutina, paso: true },
    { ...rutina, paso: 4, totalPasos: 3 },
    { ...rutina, totalPasos: 'x' },
  ];
  for (const input of bad) await assert.rejects(() => service.requestAsync(7, input), status(400));
  assert.equal(calls.notifications.length, 0);
});

test('limpia los textos: sin caracteres de control, espacios normalizados y recortados', async () => {
  const { service, calls } = setup();
  await service.requestAsync(7, { ...rutina, titulo: `  Mi\u0000  rutina ${'x'.repeat(200)}`, pasoTexto: `a\u0007  b ${'y'.repeat(300)}` });
  const body = calls.notifications[0].body;
  assert.ok(!/[\u0000-\u001F]/.test(body));
  const [, title] = /«(.*)»/.exec(body);
  assert.ok(title.length <= 80);
  assert.ok(title.startsWith('Mi rutina xxx'));
  assert.ok(calls.events[0].valor.pasoTexto.length <= 200);
  assert.ok(calls.events[0].valor.pasoTexto.startsWith('a b yyy'));
});

test('anti-repetición: el segundo pedido igual en 60 s es repetido y no notifica; otro paso, motivo o título sí', async () => {
  const { service, calls } = setup();
  await service.requestAsync(7, rutina);
  const second = await service.requestAsync(7, { ...rutina, titulo: '  lavarse  LOS dientes ' });
  assert.deepEqual(second, { avisados: ['Laura'], repetido: true });
  assert.equal(calls.notifications.length, 1);
  assert.equal(calls.events.length, 1);

  for (const variant of [{ paso: 3 }, { motivo: 'ayuda' }, { titulo: 'Otra rutina' }]) {
    assert.equal((await service.requestAsync(7, { ...rutina, ...variant })).repetido, false);
  }

  await service.requestAsync(7, { contexto: 'comunicador', motivo: 'ayuda' });
  const again = await service.requestAsync(7, { contexto: 'comunicador', motivo: 'ayuda', frase: 'otra' });
  assert.equal(again.repetido, true);
});

test('sin tutores activos: avisados vacío y el segundo pedido vuelve a intentar', async () => {
  const { service, calls } = setup({ tutores: [] });
  assert.deepEqual(await service.requestAsync(7, rutina), { avisados: [], repetido: false });
  assert.deepEqual(await service.requestAsync(7, rutina), { avisados: [], repetido: false });
  assert.equal(calls.tutorQueries.length, 2);
  assert.equal(calls.notifications.length, 0);
});

test('evento de uso: formato de rutina y de comunicador, y un fallo del registro no rompe la respuesta', async () => {
  const { service, calls } = setup();
  await service.requestAsync(7, rutina);
  await service.requestAsync(7, { contexto: 'comunicador', motivo: 'pausa', frase: 'Necesito espacio' });
  const [routineEvent, commsEvent] = calls.events;
  assert.equal(routineEvent.tipoEvento, 'ayuda_pedida');
  assert.equal(routineEvent.entidadTipo, 'rutina');
  assert.equal(routineEvent.entidadId, 'lavarse los dientes');
  assert.equal(routineEvent.origen, 'perteneciente');
  assert.equal(routineEvent.idUsuario, 7);
  assert.deepEqual(routineEvent.valor, { contexto: 'rutina', motivo: 'no_entiende', paso: 2, totalPasos: 5, titulo: 'Lavarse los dientes', pasoTexto: 'Poné pasta en el cepillo', avisados: 1 });
  assert.equal(commsEvent.entidadTipo, 'comunicador');
  assert.equal(commsEvent.entidadId, 'no_puedo_hablar');
  assert.deepEqual(commsEvent.valor, { contexto: 'comunicador', motivo: 'pausa', frase: 'Necesito espacio', avisados: 1 });

  const broken = setup();
  broken.service.HelpAlertService.UsageEventService = { logAsync: async () => { throw new Error('boom'); } };
  assert.deepEqual(await broken.service.requestAsync(7, rutina), { avisados: ['Laura'], repetido: false });
  broken.service.HelpAlertService.UsageEventService = { logAsync: () => { throw new Error('sync boom'); } };
  assert.deepEqual(await broken.service.requestAsync(7, { ...rutina, paso: 3 }), { avisados: ['Laura'], repetido: false });
});

test('los eventos generados salen en "Dónde se traba" como fila de rutina y fila "No puedo hablar"', async () => {
  const { service, calls } = setup();
  await service.requestAsync(7, rutina);
  await service.requestAsync(7, { ...rutina, titulo: 'lavarse los DIENTES', motivo: 'ayuda' });
  await service.requestAsync(7, { contexto: 'comunicador', motivo: 'ayuda' });

  const rows = calls.events.map((event, index) => ({
    tipo_evento: event.tipoEvento, entidad_tipo: event.entidadTipo, entidad_id: event.entidadId,
    valor: event.valor, ocurrido_en: `2026-10-0${index + 1}T10:00:00Z`,
  }));
  const report = buildHelpSpotsReport(rows.reverse());
  assert.equal(report.total, 3);
  assert.equal(report.comunicacion, 1);
  const routineRow = report.lugares.find((spot) => spot.contexto === 'rutina');
  assert.equal(routineRow.cantidad, 2);
  assert.equal(routineRow.paso, 2);
  assert.equal(routineRow.pasoTexto, 'Poné pasta en el cepillo');
  const commsRow = report.lugares.find((spot) => spot.contexto === 'comunicacion');
  assert.deepEqual([commsRow.titulo, commsRow.paso, commsRow.cantidad], ['No puedo hablar', null, 1]);
});
