import test from 'node:test';
import assert from 'node:assert/strict';
import { Writable } from 'node:stream';
import ReporteProfesionalService from '../src/services/ReporteProfesionalService.js';
import ReportePdfService from '../src/services/ReportePdfService.js';
import { parseIncluir, parsePacientes, parseRango } from '../src/services/ReportePdfOptions.js';

const sesionesPdf = [
  { id: 1, id_perteneciente: 5, fecha_sesion: new Date('2026-09-07T12:00:00.000Z'), titulo: 'A', estado: 'completada', duracion_minutos: 60, has_note: true },
  { id: 2, id_perteneciente: 5, fecha_sesion: new Date('2026-09-20T12:00:00.000Z'), titulo: 'B', estado: 'ausente', duracion_minutos: 60, has_note: false },
  { id: 3, id_perteneciente: 6, fecha_sesion: new Date('2026-09-10T12:00:00.000Z'), titulo: 'C', estado: 'completada', duracion_minutos: 45, has_note: false },
  { id: 4, id_perteneciente: 5, fecha_sesion: new Date('2026-08-30T12:00:00.000Z'), titulo: 'D', estado: 'completada', duracion_minutos: 60, has_note: false },
];

function pdfService({ vinculos = [5, 6] } = {}) {
  const service = new ReporteProfesionalService();
  const calls = { ia: 0 };
  service.VinculoProfesionalPertenecienteRepository = {
    getByProfesionalYPertenecienteAsync: async (_profesional, idPerteneciente) => (vinculos.includes(Number(idPerteneciente)) ? { estado_vinculo: 'activo' } : null),
  };
  service.UsuarioRepository = { getByIdAsync: async () => ({ nombre: 'Paciente Uno' }) };
  service.PertenecienteRepository = { getByIdAsync: async (id) => ({ id, id_usuario: 1, id_nivel_apoyo: null }) };
  service.NivelApoyoRepository = { getByIdAsync: async () => null };
  service.SesionProfesionalRepository = { getByProfesionalIdAsync: async () => sesionesPdf };
  service.AiReportService = { generateCaseloadOverviewAsync: async () => { calls.ia += 1; return 'texto IA'; } };
  return { service, calls };
}

test('parseRango valida fechas, orden y maximo de dias', () => {
  assert.equal(parseRango({}), null);
  const rango = parseRango({ desde: '2026-09-01', hasta: '2026-09-30' });
  assert.equal(rango.finExclusivo.toISOString(), '2026-10-01T00:00:00.000Z');
  const invalidos = [
    { desde: '2026-09-01' },
    { desde: '2026-9-1', hasta: '2026-09-30' },
    { desde: '2026-02-30', hasta: '2026-03-01' },
    { desde: '2026-09-30', hasta: '2026-09-01' },
    { desde: '2025-01-01', hasta: '2026-01-02' },
  ];
  for (const query of invalidos) {
    assert.throws(() => parseRango(query), (error) => error.statusCode === 400, JSON.stringify(query));
  }
  assert.doesNotThrow(() => parseRango({ desde: '2025-01-01', hasta: '2026-01-01' }));
});

test('parseIncluir y parsePacientes: defaults, validacion y duplicados', () => {
  assert.deepEqual([...parseIncluir({}, ['ia', 'asistencia'])], ['ia', 'asistencia']);
  assert.deepEqual([...parseIncluir({ incluir: 'detalle,asistencia' })].sort(), ['asistencia', 'detalle']);
  assert.throws(() => parseIncluir({ incluir: 'notas' }), (error) => error.statusCode === 400);
  assert.throws(() => parseIncluir({ incluir: '' }), (error) => error.statusCode === 400);
  assert.equal(parsePacientes({}), null);
  assert.deepEqual(parsePacientes({ pacientes: '5,6,5' }), [5, 6]);
  for (const pacientes of ['', 'a,2', '0', '1.5']) {
    assert.throws(() => parsePacientes({ pacientes }), (error) => error.statusCode === 400, pacientes);
  }
});

test('resumen sin opciones: igual que antes (IA + asistencia, sin detalle, todos los pacientes del mes)', async () => {
  const { service, calls } = pdfService();
  const data = await service.generateMonthlyPdfDataAsync(10, 1, 2026, 9);
  assert.equal(calls.ia, 1);
  assert.equal(data.overviewText, 'texto IA');
  assert.deepEqual(data.pacientes.map((p) => p.totalSesiones), [2, 1]);
  assert.equal(data.pacientes[0].sesiones, undefined);
  assert.deepEqual(data.incluir, ['ia', 'asistencia']);
});

test('resumen con rango, pacientes elegidos y sin IA: filtra y no llama a la IA', async () => {
  const { service, calls } = pdfService();
  const rango = parseRango({ desde: '2026-08-25', hasta: '2026-09-08' });
  const data = await service.generateMonthlyPdfDataAsync(10, 1, NaN, NaN, { rango, pacientes: [5], incluir: new Set(['asistencia', 'detalle']) });
  assert.equal(calls.ia, 0);
  assert.equal(data.overviewText, null);
  assert.equal(data.pacientes.length, 1);
  assert.equal(data.pacientes[0].totalSesiones, 2);
  assert.deepEqual(data.pacientes[0].sesiones.map((s) => s.titulo), ['D', 'A']);
  assert.ok(data.pacientes[0].sesiones.every((s) => !('contenido' in s) && !('notas_texto' in s)));
  assert.equal(data.desde, '2026-08-25');
});

test('resumen rechaza con 403 un paciente sin vinculo activo y no llama a la IA', async () => {
  const { service, calls } = pdfService({ vinculos: [5] });
  await assert.rejects(() => service.generateMonthlyPdfDataAsync(10, 1, 2026, 9, { pacientes: [5, 99] }), (error) => error.statusCode === 403);
  assert.equal(calls.ia, 0);
});

test('historial con rango acota sesiones y estadisticas; sin opciones trae todo', async () => {
  const { service } = pdfService();
  const all = await service.generatePatientHistoryPdfDataAsync(10, 1, 5);
  assert.equal(all.sesiones.length, 3);
  assert.deepEqual(all.incluir, ['asistencia', 'detalle']);
  const ranged = await service.generatePatientHistoryPdfDataAsync(10, 1, 5, { rango: parseRango({ desde: '2026-09-01', hasta: '2026-09-30' }) });
  assert.equal(ranged.sesiones.length, 2);
  assert.equal(ranged.stats.asistenciaPct, 50);
});

test('ReportePdfService arma el PDF con y sin secciones y nombra el archivo segun el periodo', async () => {
  const render = async (method, data) => {
    const chunks = [];
    const headers = {};
    const res = new Writable({ write(chunk, _enc, cb) { chunks.push(chunk); cb(); } });
    res.setHeader = (name, value) => { headers[name] = value; };
    const finished = new Promise((resolve) => res.on('finish', resolve));
    await new ReportePdfService()[method](res, data);
    await finished;
    return { headers, size: Buffer.concat(chunks).length };
  };
  const pacientes = [{ pacienteNombre: 'Ana', totalSesiones: 1, completadas: 1, canceladas: 0, ausentes: 0, asistenciaPct: 100, sesiones: [{ fecha_sesion: new Date(), titulo: 'A', estado: 'completada', duracion_minutos: 60 }] }];
  const legacy = await render('streamCaseloadPdfAsync', { profesionalNombre: 'Prof', mes: 9, anio: 2026, overviewText: null, pacientes });
  assert.match(legacy.headers['Content-Disposition'], /reporte-mensual-2026-09\.pdf/);
  const ranged = await render('streamCaseloadPdfAsync', { profesionalNombre: 'Prof', mes: NaN, anio: NaN, desde: '2026-09-01', hasta: '2026-09-15', overviewText: 'x', pacientes, incluir: ['ia', 'detalle'] });
  assert.match(ranged.headers['Content-Disposition'], /reporte-2026-09-01-2026-09-15\.pdf/);
  assert.ok(ranged.size > 500);
  const stats = { total: 1, completadas: 1, canceladas: 0, ausentes: 0, asistenciaPct: 100 };
  const history = await render('streamPatientHistoryPdfAsync', { profesionalNombre: 'Prof', pacienteNombre: 'Ana', stats, sesiones: [], incluir: ['asistencia'] });
  assert.ok(history.size > 500);
});
