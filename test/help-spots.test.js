import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildHelpSpotsReport, extractSteps, parseHelpDaysParam } from '../src/modules/usage/help-spots.js';
import UsageEventService from '../src/services/UsageEventService.js';

const help = (entidadId, motivo, paso, ocurridoEn, saved = {}) => ({
  tipo_evento: 'ayuda_pedida', entidad_tipo: 'actividad_asignada', entidad_id: String(entidadId),
  valor: { motivo, paso, avisados: 1, ...saved }, ocurrido_en: ocurridoEn,
});
const comms = (ocurridoEn) => ({ tipo_evento: 'tarjeta_autonomia_usada', entidad_tipo: 'modo_no_puedo_hablar', entidad_id: 'p1', valor: { label: 'Agua' }, ocurrido_en: ocurridoEn });
const context = new Map([
  [10, { titulo: 'Preparar la mochila', descripcion: 'Texto\nObjetivo: x\nPasos: Mirar el horario | Sacar lo que no necesitás | Agregar cuadernos y útiles\nJuego: {}' }],
  [11, { titulo: 'Ordenar el escritorio', descripcion: 'Pasos: Sacar todo | Limpiar la superficie' }],
]);

test('parseHelpDaysParam: default 30, entero 1-90, resto invalido', () => {
  assert.equal(parseHelpDaysParam(undefined), 30);
  assert.equal(parseHelpDaysParam(''), 30);
  assert.equal(parseHelpDaysParam('7'), 7);
  assert.equal(parseHelpDaysParam('90'), 90);
  for (const bad of ['0', '91', '-1', 'abc', '1.5']) assert.equal(parseHelpDaysParam(bad), null);
});

test('extractSteps lee la linea Pasos y devuelve [] si no hay', () => {
  assert.deepEqual(extractSteps('a\nPasos: uno | dos |  | tres'), ['uno', 'dos', 'tres']);
  assert.deepEqual(extractSteps('sin pasos'), []);
  assert.deepEqual(extractSteps(null), []);
});

test('buildHelpSpotsReport: agrupa por actividad y paso, cuenta por motivo y ordena', () => {
  const events = [
    help(10, 'ayuda', 3, '2026-10-01T10:00:00Z'),
    help(10, 'no_entiende', 3, '2026-10-03T10:00:00Z'),
    help(10, 'ayuda', 3, '2026-10-02T10:00:00Z'),
    help(11, 'pausa', 2, '2026-10-04T10:00:00Z'),
    comms('2026-10-05T10:00:00Z'),
  ];
  const report = buildHelpSpotsReport(events, context, { dias: 30 });
  assert.equal(report.dias, 30);
  assert.equal(report.total, 5);
  assert.deepEqual(report.porMotivo, { ayuda: 2, no_entiende: 1, pausa: 1 });
  assert.equal(report.comunicacion, 1);
  assert.equal(report.total, report.porMotivo.ayuda + report.porMotivo.no_entiende + report.porMotivo.pausa + report.comunicacion);
  assert.equal(report.lugares.length, 3);
  assert.deepEqual(report.lugares[0], {
    contexto: 'actividad', titulo: 'Preparar la mochila', paso: 3, pasoTexto: 'Agregar cuadernos y útiles',
    cantidad: 3, ultimaVez: '2026-10-03T10:00:00.000Z',
  });
  // empate de cantidad (1): gana la mas reciente
  assert.equal(report.lugares[1].contexto, 'comunicacion');
  assert.equal(report.lugares[1].titulo, 'No puedo hablar');
  assert.equal(report.lugares[1].paso, null);
  assert.equal(report.lugares[2].pasoTexto, 'Limpiar la superficie');
});

test('buildHelpSpotsReport: sin eventos da un informe vacio', () => {
  assert.deepEqual(buildHelpSpotsReport([], new Map(), { dias: 30 }), { dias: 30, total: 0, porMotivo: { ayuda: 0, no_entiende: 0, pausa: 0 }, comunicacion: 0, lugares: [] });
});

test('buildHelpSpotsReport: ignora motivos invalidos y tolera actividad desconocida o paso fuera de rango', () => {
  const report = buildHelpSpotsReport([
    help(10, 'crisis', 1, '2026-10-01T10:00:00Z'),
    help(99, 'ayuda', 7, '2026-10-01T10:00:00Z'),
    help(10, 'ayuda', 'x', '2026-10-01T10:00:00Z'),
  ], context);
  assert.equal(report.total, 2);
  assert.equal(report.porMotivo.ayuda, 2);
  const unknown = report.lugares.find((spot) => spot.paso === 7);
  assert.equal(unknown.titulo, 'Actividad');
  assert.equal(unknown.pasoTexto, null);
  assert.equal(report.lugares.find((spot) => spot.paso === null).titulo, 'Preparar la mochila');
});

test('buildHelpSpotsReport: devuelve como maximo 10 lugares', () => {
  const events = Array.from({ length: 15 }, (_, index) => help(10, 'ayuda', index + 1, '2026-10-01T10:00:00Z'));
  assert.equal(buildHelpSpotsReport(events, context).lugares.length, 10);
});

test('getHelpSpotsAsync: junta eventos y contexto del usuario, y no pide actividades si no hay eventos de ayuda', async () => {
  const calls = {};
  const service = new UsageEventService();
  service.ensureSchemaAsync = async () => {};
  service.UsageEventRepository = {
    getHelpEventsSinceAsync: async (idUsuario, desde) => { calls.events = { idUsuario, desde }; return [help(10, 'ayuda', 1, '2026-10-01T10:00:00Z'), comms('2026-10-02T10:00:00Z')]; },
  };
  service.ActividadAsignadaRepository = {
    getHelpContextByIdsAsync: async (ids, idUsuario) => { calls.context = { ids, idUsuario }; return [{ id: 10, titulo: 'Preparar la mochila', descripcion: 'Pasos: Mirar el horario' }]; },
  };
  const report = await service.getHelpSpotsAsync(7, 30);
  assert.equal(calls.events.idUsuario, 7);
  assert.ok(Math.abs(Date.now() - new Date(calls.events.desde).getTime() - 30 * 86400000) < 5000);
  assert.deepEqual(calls.context, { ids: [10], idUsuario: 7 });
  assert.equal(report.lugares.find((spot) => spot.contexto === 'actividad').pasoTexto, 'Mirar el horario');

  service.UsageEventRepository.getHelpEventsSinceAsync = async () => [comms('2026-10-02T10:00:00Z')];
  calls.context = null;
  await service.getHelpSpotsAsync(7, 30);
  assert.deepEqual(calls.context, { ids: [], idUsuario: 7 });
});

test('buildHelpSpotsReport: usa titulo y pasoTexto guardados en el evento, aunque la actividad haya cambiado', () => {
  const changed = new Map([[10, { titulo: 'Titulo nuevo', descripcion: 'Pasos: otro | otro 2 | otro 3' }]]);
  const report = buildHelpSpotsReport([
    help(10, 'ayuda', 3, '2026-10-02T10:00:00Z', { titulo: 'Preparar la mochila', pasoTexto: 'Agregar cuadernos' }),
    help(10, 'ayuda', 3, '2026-10-01T10:00:00Z', { titulo: 'Titulo viejo', pasoTexto: 'Texto viejo' }),
  ], changed);
  assert.equal(report.lugares.length, 1);
  assert.equal(report.lugares[0].titulo, 'Preparar la mochila');
  assert.equal(report.lugares[0].pasoTexto, 'Agregar cuadernos');
  assert.equal(report.lugares[0].cantidad, 2);
});

test('getHelpSpotsAsync: no consulta actividades si todos los eventos traen titulo guardado', async () => {
  const service = new UsageEventService();
  service.ensureSchemaAsync = async () => {};
  service.UsageEventRepository = { getHelpEventsSinceAsync: async () => [help(10, 'ayuda', 1, '2026-10-01T10:00:00Z', { titulo: 'A', pasoTexto: 'B' })] };
  let ids = null;
  service.ActividadAsignadaRepository = { getHelpContextByIdsAsync: async (list) => { ids = list; return []; } };
  const report = await service.getHelpSpotsAsync(7, 30);
  assert.deepEqual(ids, []);
  assert.equal(report.lugares[0].titulo, 'A');
});
