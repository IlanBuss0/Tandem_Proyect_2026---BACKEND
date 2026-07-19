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
