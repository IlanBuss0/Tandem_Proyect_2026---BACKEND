import test from 'node:test';
import assert from 'node:assert/strict';
import ReporteProfesionalService from '../src/services/ReporteProfesionalService.js';
import AiReportService from '../src/services/AiReportService.js';

test('assertVinculoActivoAsync rechaza si no hay vinculo entre ese profesional y ese perteneciente', async () => {
  const service = new ReporteProfesionalService();
  service.VinculoProfesionalPertenecienteRepository = {
    getByProfesionalYPertenecienteAsync: async () => null,
  };
  await assert.rejects(
    () => service.assertVinculoActivoAsync(10, 5),
    error => error.statusCode === 403,
  );
});

test('assertVinculoActivoAsync acepta un vinculo propio y activo', async () => {
  const service = new ReporteProfesionalService();
  service.VinculoProfesionalPertenecienteRepository = {
    getByProfesionalYPertenecienteAsync: async () => ({ id_profesional: 10, estado_vinculo: 'aprobado' }),
  };
  await assert.doesNotReject(() => service.assertVinculoActivoAsync(10, 5));
});

test('AiReportService tira 503 si no hay API key configurada', async () => {
  const service = new AiReportService();
  service.apiKey = null;
  await assert.rejects(
    () => service.generatePatientSummaryAsync({ pacienteNombre: 'Juan', nivelApoyoNombre: null, sesiones: [] }),
    error => error.statusCode === 503,
  );
});

test('generateScheduledAsync nunca manda texto de notas a la IA', async () => {
  const service = new ReporteProfesionalService();
  let capturedNotasTexto = 'sin-llamar';
  service.PertenecienteRepository = { getByIdAsync: async () => ({ id: 5, id_usuario: 1, id_nivel_apoyo: null }) };
  service.UsuarioRepository = { getByIdAsync: async () => ({ nombre: 'Juan Pered' }) };
  service.NivelApoyoRepository = { getByIdAsync: async () => null };
  service.SesionProfesionalRepository = {
    getByProfesionalIdAsync: async () => [
      { id_perteneciente: 5, fecha_sesion: '2026-07-20T12:00:00.000Z', titulo: 'Sesion', estado: 'completada' },
    ],
  };
  service.AiReportService = {
    generatePatientSummaryAsync: async ({ notasTexto }) => {
      capturedNotasTexto = notasTexto;
      return { titulo: 'Reporte', contenido: 'texto generado' };
    },
  };
  service.ReporteProfesionalRepository = {
    createAsync: async (entity) => ({ id: 1, ...entity }),
  };

  const reporte = await service.generateScheduledAsync(10, 5);
  assert.equal(capturedNotasTexto, null);
  assert.equal(reporte.id_tipo, 'programado');
});

test('generateOnDemandAsync manda el texto de notas seleccionadas a la IA', async () => {
  const service = new ReporteProfesionalService();
  let capturedNotasTexto = null;
  service.VinculoProfesionalPertenecienteRepository = {
    getByProfesionalYPertenecienteAsync: async () => ({ id_profesional: 10, estado_vinculo: 'activo' }),
  };
  service.PertenecienteRepository = { getByIdAsync: async () => ({ id: 5, id_usuario: 1, id_nivel_apoyo: null }) };
  service.UsuarioRepository = { getByIdAsync: async () => ({ nombre: 'Juan Pered' }) };
  service.NivelApoyoRepository = { getByIdAsync: async () => null };
  service.AiReportService = {
    generatePatientSummaryAsync: async ({ notasTexto }) => {
      capturedNotasTexto = notasTexto;
      return { titulo: 'Reporte', contenido: 'texto generado' };
    },
  };
  service.ReporteProfesionalRepository = {
    createAsync: async (entity) => ({ id: 1, ...entity }),
  };

  await service.generateOnDemandAsync(1, 10, {
    id_perteneciente: 5,
    sesiones: [{ id: 1, fecha_sesion: '2026-07-20T12:00:00.000Z', titulo: 'Sesion', estado: 'completada', notas_texto: 'contenido de la nota' }],
  });

  assert.ok(Array.isArray(capturedNotasTexto));
  assert.equal(capturedNotasTexto[0].texto, 'contenido de la nota');
});

test('sendToTutorAsync escribe fecha_envio como objeto Date, no como string', async () => {
  const service = new ReporteProfesionalService();
  let capturedFechaEnvio = null;

  service.ReporteProfesionalRepository = {
    getByIdAsync: async () => ({ id: 1, id_profesional: 10, id_perteneciente: 5, titulo: 'Reporte', contenido: 'texto' }),
    markSentAsync: async (id) => ({ id, enviado_al_tutor: true }),
  };
  service.VinculoTutorPertenecienteRepository = {
    getTutorPrincipalByPertenecienteAsync: async () => ({ id_tutor: 3 }),
  };
  service.TutorRepository = {
    getByIdAsync: async () => ({ id_usuario: 20 }),
  };
  service.ChatService = {
    createDirectChatAsync: async () => ({ chat: { id: 99 } }),
  };
  service.TipoMensajeRepository = {
    getAllAsync: async () => [{ id: 1, nombre: 'Texto' }],
  };
  service.MensajeService = {
    createFromUserAsync: async (entity) => {
      capturedFechaEnvio = entity.fecha_envio;
      return { id: 1 };
    },
  };
  service.NotificationProducerService = {
    createAsync: async () => 1,
  };

  await service.sendToTutorAsync(1, 1, 10);

  assert.ok(capturedFechaEnvio instanceof Date, 'fecha_envio debe ser un objeto Date, no un string');
});

test('sendToTutorAsync rechaza enviar un reporte de otro profesional', async () => {
  const service = new ReporteProfesionalService();
  service.ReporteProfesionalRepository = {
    getByIdAsync: async () => ({ id: 1, id_profesional: 99, id_perteneciente: 5 }),
  };
  await assert.rejects(
    () => service.sendToTutorAsync(1, 1, 10),
    error => error.statusCode === 403,
  );
});

test('generateSessionPrepAsync nunca persiste y no requiere id', async () => {
  const service = new ReporteProfesionalService();
  service.VinculoProfesionalPertenecienteRepository = {
    getByProfesionalYPertenecienteAsync: async () => ({ id_profesional: 10, estado_vinculo: 'activo' }),
  };
  service.PertenecienteRepository = { getByIdAsync: async () => ({ id: 5, id_usuario: 1, id_nivel_apoyo: null }) };
  service.UsuarioRepository = { getByIdAsync: async () => ({ nombre: 'Juan Pered' }) };
  service.NivelApoyoRepository = { getByIdAsync: async () => null };
  service.AiReportService = {
    generateSessionPrepAsync: async () => ({ titulo: 'Preparacion', contenido: 'texto generado' }),
  };
  // Deliberadamente NO se mockea ReporteProfesionalRepository.createAsync — si
  // el servicio intentara persistir, esto fallaria con una conexion real.

  const result = await service.generateSessionPrepAsync(10, {
    id_perteneciente: 5,
    sesion_objetivo: { titulo: 'Sesion de hoy', fecha_sesion: '2026-07-25T12:00:00.000Z' },
    sesiones_pasadas: [
      { id: 1, fecha_sesion: '2026-07-18T12:00:00.000Z', titulo: 'Sesion pasada', estado: 'completada', notas_texto: 'nota' },
    ],
  });

  assert.equal(result.titulo, 'Preparacion');
  assert.equal(result.id, undefined);
});

test('generateSessionPrepAsync rechaza si no hay vinculo activo', async () => {
  const service = new ReporteProfesionalService();
  service.VinculoProfesionalPertenecienteRepository = {
    getByProfesionalYPertenecienteAsync: async () => null,
  };
  await assert.rejects(
    () => service.generateSessionPrepAsync(10, {
      id_perteneciente: 5,
      sesion_objetivo: { titulo: 'Sesion', fecha_sesion: '2026-07-25T12:00:00.000Z' },
      sesiones_pasadas: [{ id: 1, fecha_sesion: '2026-07-18T12:00:00.000Z', titulo: 'Pasada', estado: 'completada', notas_texto: 'nota' }],
    }),
    error => error.statusCode === 403,
  );
});

test('generateSessionPrepAsync rechaza si ninguna sesion pasada tiene contenido de nota', async () => {
  const service = new ReporteProfesionalService();
  service.VinculoProfesionalPertenecienteRepository = {
    getByProfesionalYPertenecienteAsync: async () => ({ id_profesional: 10, estado_vinculo: 'activo' }),
  };
  await assert.rejects(
    () => service.generateSessionPrepAsync(10, {
      id_perteneciente: 5,
      sesion_objetivo: { titulo: 'Sesion', fecha_sesion: '2026-07-25T12:00:00.000Z' },
      sesiones_pasadas: [{ id: 1, fecha_sesion: '2026-07-18T12:00:00.000Z', titulo: 'Pasada', estado: 'completada' }],
    }),
  );
});

test('answerPatientQuestionAsync nunca persiste y devuelve la respuesta', async () => {
  const service = new ReporteProfesionalService();
  service.VinculoProfesionalPertenecienteRepository = {
    getByProfesionalYPertenecienteAsync: async () => ({ id_profesional: 10, estado_vinculo: 'activo' }),
  };
  service.PertenecienteRepository = { getByIdAsync: async () => ({ id: 5, id_usuario: 1, id_nivel_apoyo: null }) };
  service.UsuarioRepository = { getByIdAsync: async () => ({ nombre: 'Juan Pered' }) };
  service.NivelApoyoRepository = { getByIdAsync: async () => null };
  service.AiReportService = {
    answerPatientQuestionAsync: async ({ pregunta }) => ({ respuesta: `Respuesta a: ${pregunta}` }),
  };

  const result = await service.answerPatientQuestionAsync(10, {
    id_perteneciente: 5,
    pregunta: '¿Como venia con las rutinas?',
    sesiones: [{ id: 1, fecha_sesion: '2026-07-18T12:00:00.000Z', titulo: 'Sesion', estado: 'completada', notas_texto: 'nota' }],
  });

  assert.equal(result.respuesta, 'Respuesta a: ¿Como venia con las rutinas?');
});

test('answerPatientQuestionAsync rechaza sin pregunta', async () => {
  const service = new ReporteProfesionalService();
  await assert.rejects(() => service.answerPatientQuestionAsync(10, {
    id_perteneciente: 5,
    pregunta: '',
    sesiones: [{ id: 1, fecha_sesion: '2026-07-18T12:00:00.000Z', titulo: 'Sesion', estado: 'completada', notas_texto: 'nota' }],
  }));
});

test('generatePatientHistoryPdfDataAsync calcula estadisticas correctas por paciente', async () => {
  const service = new ReporteProfesionalService();
  service.VinculoProfesionalPertenecienteRepository = {
    getByProfesionalYPertenecienteAsync: async () => ({ id_profesional: 10, estado_vinculo: 'activo' }),
  };
  service.UsuarioRepository = { getByIdAsync: async () => ({ nombre: 'Lucia Fernandez' }) };
  service.PertenecienteRepository = { getByIdAsync: async () => ({ id: 5, id_usuario: 1, id_nivel_apoyo: null }) };
  service.NivelApoyoRepository = { getByIdAsync: async () => null };
  // node-postgres devuelve objetos Date (no strings) para columnas
  // timestamptz cuando se consulta directo desde el repositorio (recien se
  // vuelven string al pasar por JSON.stringify en la respuesta HTTP) — el
  // mock usa Date a proposito para no ocultar bugs como el de
  // "fecha_sesion.localeCompare is not a function" que este test detecto.
  service.SesionProfesionalRepository = {
    getByProfesionalIdAsync: async () => [
      { id: 1, id_perteneciente: 5, fecha_sesion: new Date('2026-07-01T12:00:00.000Z'), titulo: 'A', estado: 'completada', duracion_minutos: 60, has_note: true },
      { id: 2, id_perteneciente: 5, fecha_sesion: new Date('2026-07-08T12:00:00.000Z'), titulo: 'B', estado: 'ausente', duracion_minutos: 60, has_note: false },
      { id: 3, id_perteneciente: 99, fecha_sesion: new Date('2026-07-08T12:00:00.000Z'), titulo: 'Otro paciente', estado: 'completada', duracion_minutos: 60, has_note: false },
    ],
  };

  const data = await service.generatePatientHistoryPdfDataAsync(10, 1, 5);

  assert.equal(data.sesiones.length, 2);
  assert.equal(data.stats.total, 2);
  assert.equal(data.stats.completadas, 1);
  assert.equal(data.stats.ausentes, 1);
  assert.equal(data.stats.asistenciaPct, 50);
});

test('PacienteInactivoRepository.getInactivosAsync no revienta y devuelve un array', async () => {
  const { default: PacienteInactivoRepository } = await import('../src/repositories/PacienteInactivoRepository.js');
  const repo = new PacienteInactivoRepository();
  const rows = await repo.getInactivosAsync(14);
  assert.ok(Array.isArray(rows));
});
