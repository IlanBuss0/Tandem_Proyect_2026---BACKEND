import test from 'node:test';
import assert from 'node:assert/strict';
import SesionProfesionalService from '../src/services/SesionProfesionalService.js';
import PerfilProfesionalService from '../src/services/PerfilProfesionalService.js';
import ProfesionalService from '../src/services/ProfesionalService.js';
import VinculoProfesionalPertenecienteService from '../src/services/VinculoProfesionalPertenecienteService.js';
import ValidacionProfesionalService from '../src/services/ValidacionProfesionalService.js';
import ResenaProfesionalService from '../src/services/ResenaProfesionalService.js';
import AuthorizationService from '../src/services/AuthorizationService.js';

test('una nota privada no puede ser leida por otro profesional', async () => {
  const service = new SesionProfesionalService();
  service.SesionProfesionalRepository = {
    getByIdAsync: async () => ({ id: 7, id_profesional: 10 }),
  };
  await assert.rejects(() => service.getPrivateNoteAsync(7, 11), error => error.statusCode === 403);
});

test('linkDriveDocumentAsync rechaza vincular un documento a la sesion de otro profesional', async () => {
  const service = new SesionProfesionalService();
  service.SesionProfesionalRepository = {
    getByIdAsync: async () => ({ id: 7, id_profesional: 10 }),
  };
  await assert.rejects(
    () => service.linkDriveDocumentAsync(7, 11, { google_file_id: 'AbCdEfGhIjKlMnOp' }),
    error => error.statusCode === 403,
  );
});

test('Drive deriva una URL de Google Docs y no confia en la URL recibida', async () => {
  const service = new SesionProfesionalService();
  let saved;
  service.SesionProfesionalRepository = {
    getByIdAsync: async () => ({ id: 7, id_profesional: 10 }),
  };
  service.getPrivateNoteAsync = async () => ({ id: 3 });
  service.SesionProfesionalRepository.upsertDriveDocumentAsync = async (_id, document) => { saved = document; return document; };
  await service.linkDriveDocumentAsync(7, 10, {
    google_file_id: 'AbCdEfGhIjKlMnOp', nombre: 'Ficha', web_view_url: 'https://evil.example',
  });
  assert.equal(saved.web_view_url, 'https://docs.google.com/document/d/AbCdEfGhIjKlMnOp/edit');
  assert.equal(saved.mime_type, 'application/vnd.google-apps.document');
});

test('linkDriveDocumentAsync crea el ancla de nota si todavia no existe', async () => {
  const service = new SesionProfesionalService();
  let ensured = false;
  service.SesionProfesionalRepository = {
    getByIdAsync: async () => ({ id: 7, id_profesional: 10 }),
    ensurePrivateNoteAsync: async (idSesion, idProfesional) => {
      ensured = true;
      assert.equal(idSesion, 7);
      assert.equal(idProfesional, 10);
      return { id: 3 };
    },
    upsertDriveDocumentAsync: async (_id, document) => document,
  };
  service.getPrivateNoteAsync = async () => null;
  await service.linkDriveDocumentAsync(7, 10, { google_file_id: 'AbCdEfGhIjKlMnOp' });
  assert.equal(ensured, true);
});

const GROUP_ID = '11111111-2222-3333-4444-555555555555';

function seriesRow(overrides = {}) {
  return {
    id: 1,
    id_profesional: 10,
    id_perteneciente: 20,
    fecha_sesion: '2026-01-01T12:00:00.000Z',
    titulo: 'Sesion profesional',
    duracion_minutos: 60,
    estado: 'programada',
    recordatorios: [],
    recurrence_group_id: GROUP_ID,
    recurrence_rule: { frequency: 'monthly', count: 3 },
    recurrence_index: 0,
    ...overrides,
  };
}

function mockRepositoryFor(service, rows, pastCount) {
  service.SesionProfesionalRepository = {
    resizeSeriesAsync: async (groupId, computeChanges) => {
      assert.equal(groupId, GROUP_ID);
      return computeChanges(rows, pastCount);
    },
  };
}

test('resize de serie: agrandar agrega sesiones futuras continuando el patron', async () => {
  const service = new SesionProfesionalService();
  const rows = [0, 1, 2].map(i => seriesRow({
    id: i + 1,
    fecha_sesion: new Date(Date.UTC(2026, i, 1, 12)).toISOString(),
    recurrence_index: i,
  }));
  mockRepositoryFor(service, rows, 0);

  const result = await service.resizeSeriesAsync(GROUP_ID, 10, { count: 6 });
  assert.equal(result.toInsert.length, 3);
  assert.deepEqual(result.toInsert.map(e => e.recurrence_index), [3, 4, 5]);
  assert.equal(result.toInsert[0].estado, 'programada');
  assert.equal(result.finalRule.count, 6);
  assert.equal(result.toDeleteIds.length, 0);
  // Continua el patron mensual desde la primera fecha (enero -> abril, mayo, junio)
  assert.equal(new Date(result.toInsert[0].fecha_sesion).getUTCMonth(), 3);
});

test('resize de serie: el proximo indice no colisiona si se borro una sesion suelta del medio', async () => {
  const service = new SesionProfesionalService();
  // Se borro la sesion de indice 2 con el DELETE individual existente.
  const rows = [0, 1, 3, 4].map(i => seriesRow({
    id: i + 1,
    fecha_sesion: new Date(Date.UTC(2026, i, 1, 12)).toISOString(),
    recurrence_index: i,
  }));
  mockRepositoryFor(service, rows, 0);

  const result = await service.resizeSeriesAsync(GROUP_ID, 10, { count: 6 });
  assert.equal(result.toInsert.length, 2);
  assert.deepEqual(result.toInsert.map(e => e.recurrence_index), [5, 6]);
});

test('resize de serie: achicar borra las ultimas (futuras) sesiones', async () => {
  const service = new SesionProfesionalService();
  const rows = Array.from({ length: 10 }, (_, i) => seriesRow({
    id: i + 1,
    fecha_sesion: new Date(Date.UTC(2026, i, 1, 12)).toISOString(),
    recurrence_index: i,
  }));
  mockRepositoryFor(service, rows, 0);

  const result = await service.resizeSeriesAsync(GROUP_ID, 10, { count: 5 });
  assert.deepEqual(result.toDeleteIds, [6, 7, 8, 9, 10]);
  assert.equal(result.toInsert.length, 0);
  assert.equal(result.finalRule.count, 5);
});

test('resize de serie: no deja bajar por debajo de las sesiones que ya pasaron', async () => {
  const service = new SesionProfesionalService();
  const rows = Array.from({ length: 10 }, (_, i) => seriesRow({ id: i + 1, recurrence_index: i }));
  mockRepositoryFor(service, rows, 4); // 4 ya pasaron

  await assert.rejects(
    () => service.resizeSeriesAsync(GROUP_ID, 10, { count: 3 }),
    error => error.statusCode === 400 && /4 sesion/.test(error.message),
  );
});

test('resize de serie: solo renombrar no toca sesiones', async () => {
  const service = new SesionProfesionalService();
  const rows = [seriesRow()];
  mockRepositoryFor(service, rows, 0);

  const result = await service.resizeSeriesAsync(GROUP_ID, 10, { titulo: '  Seguimiento mensual  ' });
  assert.equal(result.effectiveTitulo, 'Seguimiento mensual');
  assert.equal(result.toInsert.length, 0);
  assert.equal(result.toDeleteIds.length, 0);
  assert.equal(result.finalRule.count, 3); // el count original de la regla, sin tocar
});

test('resize de serie: marca como completadas solo las pasadas y en estado programada', async () => {
  const service = new SesionProfesionalService();
  const past = Date.UTC(2020, 0, 1, 12); // muy en el pasado
  const future = Date.UTC(2099, 0, 1, 12); // muy en el futuro
  const rows = [
    seriesRow({ id: 1, fecha_sesion: new Date(past).toISOString(), estado: 'programada', recurrence_index: 0 }),
    seriesRow({ id: 2, fecha_sesion: new Date(past).toISOString(), estado: 'cancelada', recurrence_index: 1 }), // no tocar
    seriesRow({ id: 3, fecha_sesion: new Date(past).toISOString(), estado: 'completada', recurrence_index: 2 }), // ya estaba
    seriesRow({ id: 4, fecha_sesion: new Date(future).toISOString(), estado: 'programada', recurrence_index: 3 }), // futura, no tocar
  ];
  mockRepositoryFor(service, rows, 3);

  const result = await service.resizeSeriesAsync(GROUP_ID, 10, { markPastAsCompleted: true });
  assert.deepEqual(result.toCompleteIds, [1]);
});

test('resize de serie: sin markPastAsCompleted no toca ninguna sesion', async () => {
  const service = new SesionProfesionalService();
  const rows = [seriesRow({ id: 1, fecha_sesion: new Date(Date.UTC(2020, 0, 1)).toISOString(), estado: 'programada' })];
  mockRepositoryFor(service, rows, 1);

  const result = await service.resizeSeriesAsync(GROUP_ID, 10, { titulo: 'Otra cosa' });
  assert.deepEqual(result.toCompleteIds, []);
});

test('resize de serie: rechaza modificar una serie de otro profesional', async () => {
  const service = new SesionProfesionalService();
  mockRepositoryFor(service, [seriesRow({ id_profesional: 99 })], 0);
  await assert.rejects(
    () => service.resizeSeriesAsync(GROUP_ID, 10, { count: 5 }),
    error => error.statusCode === 403,
  );
});

test('resize de serie: rechaza un groupId con formato invalido', async () => {
  const service = new SesionProfesionalService();
  await assert.rejects(
    () => service.resizeSeriesAsync('no-es-un-uuid', 10, { count: 5 }),
    error => error.statusCode === 400,
  );
});

test('resize de serie: rechaza count fuera de rango', async () => {
  const service = new SesionProfesionalService();
  await assert.rejects(
    () => service.resizeSeriesAsync(GROUP_ID, 10, { count: 100 }),
    error => error.statusCode === 400,
  );
});

test('el perfil no publica contactos con formato invalido', async () => {
  const service = new PerfilProfesionalService();
  await assert.rejects(
    () => service.saveMineAsync(2, { publicar_correo: true, correo_contacto: 'incorrecto' }),
    error => error.statusCode === 400,
  );
  await assert.rejects(
    () => service.saveMineAsync(2, { publicar_whatsapp: true, whatsapp_contacto: '123' }),
    error => error.statusCode === 400,
  );
});

test('ProfesionalService.updateMineAsync ignora id_estado_validacion e id enviados por el cliente', async () => {
  const service = new ProfesionalService();
  let capturedEntity;
  service.ProfesionalRepository = {
    getByUsuarioIdAsync: async () => ({
      id: 5, id_usuario: 2, profesion: 'Psicologia', especialidad: null,
      matricula: 'MAT-1', institucion: null, id_estado_validacion: 3,
    }),
    getByMatriculaAsync: async () => null,
    updateAsync: async (entity) => { capturedEntity = entity; return 1; },
  };

  const rowsAffected = await service.updateMineAsync(2, {
    profesion: 'Psicopedagogia', id_estado_validacion: 999, id: 12345, id_usuario: 777,
  });

  assert.equal(rowsAffected, 1);
  assert.equal(capturedEntity.id, 5);
  assert.equal(capturedEntity.id_usuario, 2);
  assert.equal(capturedEntity.profesion, 'Psicopedagogia');
  assert.equal(capturedEntity.id_estado_validacion, undefined);
});

test('ProfesionalService.updateMineAsync resetea la validacion a pendiente si cambia la matricula', async () => {
  const service = new ProfesionalService();
  let capturedEntity;
  service.ProfesionalRepository = {
    getByUsuarioIdAsync: async () => ({ id: 5, id_usuario: 2, matricula: 'MAT-1', id_estado_validacion: 3 }),
    getByMatriculaAsync: async () => null,
    getEstadoValidacionPendienteAsync: async () => ({ id: 1, nombre: 'Pendiente' }),
    updateAsync: async (entity) => { capturedEntity = entity; return 1; },
  };

  await service.updateMineAsync(2, { matricula: 'MAT-2' });

  assert.equal(capturedEntity.matricula, 'MAT-2');
  assert.equal(capturedEntity.id_estado_validacion, 1);
});

test('ProfesionalService.createMineAsync rechaza si ya existe un profesional para el usuario', async () => {
  const service = new ProfesionalService();
  service.ProfesionalRepository = { getByUsuarioIdAsync: async () => ({ id: 1 }) };

  await assert.rejects(
    () => service.createMineAsync(2, { profesion: 'Psicologia', matricula: 'MAT-1' }),
    error => error.statusCode === 409,
  );
});

test('VinculoProfesionalPertenecienteService.getForUserContextAsync scopea por el profesional autenticado', async () => {
  const original = AuthorizationService.getUserContext;
  try {
    AuthorizationService.getUserContext = async () => ({ profesional: { id: 10 } });
    const service = new VinculoProfesionalPertenecienteService();
    service.VinculoProfesionalPertenecienteRepository = {
      getByProfesionalIdAsync: async (id) => { assert.equal(id, 10); return [{ id: 1 }]; },
      getByPertenecienteIdAsync: async () => [],
      getByTutorIdAsync: async () => [],
    };

    const rows = await service.getForUserContextAsync(99);
    assert.deepEqual(rows, [{ id: 1 }]);
  } finally {
    AuthorizationService.getUserContext = original;
  }
});

test('VinculoProfesionalPertenecienteService.getByIdForUserAsync rechaza a quien no participa del vinculo', async () => {
  const original = AuthorizationService.getUserContext;
  try {
    AuthorizationService.getUserContext = async () => ({ profesional: { id: 10 } });
    const service = new VinculoProfesionalPertenecienteService();
    service.VinculoProfesionalPertenecienteRepository = {
      getByIdAsync: async () => ({ id: 5, id_profesional: 999, id_perteneciente: 20 }),
    };

    await assert.rejects(() => service.getByIdForUserAsync(99, 5), error => error.statusCode === 403);
  } finally {
    AuthorizationService.getUserContext = original;
  }
});

test('ValidacionProfesionalService.createMineAsync pinea id_profesional desde el contexto, no del body', async () => {
  const service = new ValidacionProfesionalService();
  let capturedEntity;
  service.ProfesionalRepository = { getByUsuarioIdAsync: async () => ({ id: 10, matricula: 'MAT-1' }) };
  service.ValidacionProfesionalRepository = {
    getEstadoValidacionPendienteAsync: async () => ({ id: 2, nombre: 'Pendiente' }),
    createAsync: async (entity) => { capturedEntity = entity; return 1; },
  };

  await service.createMineAsync(5, {
    numero_matricula: 'MAT-1', titulo_profesional: 'Lic.', documento_dni_url: 'http://x', id_profesional: 9999,
  });

  assert.equal(capturedEntity.id_profesional, 10);
  assert.equal(capturedEntity.id_estado_validacion, 2);
});

test('ResenaProfesionalService.updateMineAsync rechaza editar la resena de otro usuario', async () => {
  const service = new ResenaProfesionalService();
  service.ResenaProfesionalRepository = {
    getByIdAsync: async () => ({ id: 1, id_profesional: 3, id_usuario: 77 }),
  };

  await assert.rejects(
    () => service.updateMineAsync(2, 1, { puntaje: 5 }),
    error => error.statusCode === 403,
  );
});

test('ResenaProfesionalService.createMineAsync rechaza puntaje fuera de rango', async () => {
  const service = new ResenaProfesionalService();
  await assert.rejects(
    () => service.createMineAsync(2, { id_profesional: 3, puntaje: 8 }),
    error => error.statusCode === 400,
  );
});

test('validarSesionParaCrear rechaza un estado fuera de la whitelist', async () => {
  const service = new SesionProfesionalService();
  assert.throws(
    () => service.validarSesionParaCrear({
      id_profesional: 10, id_perteneciente: 20, fecha_sesion: '2026-01-01T12:00:00Z',
      duracion_minutos: 60, estado: 'en_pausa',
    }),
  );
});

test('validarSesionParaCrear acepta el estado ausente', async () => {
  const service = new SesionProfesionalService();
  assert.doesNotThrow(() => service.validarSesionParaCrear({
    id_profesional: 10, id_perteneciente: 20, fecha_sesion: '2026-01-01T12:00:00Z',
    duracion_minutos: 60, estado: 'ausente',
  }));
});

test('validarSesionParaActualizar rechaza un estado fuera de la whitelist', async () => {
  const service = new SesionProfesionalService();
  assert.throws(
    () => service.validarSesionParaActualizar({ estado: 'en_pausa' }),
    error => error.statusCode === 400,
  );
});

test('validarSesionParaActualizar rechaza un motivo_cancelacion demasiado largo', async () => {
  const service = new SesionProfesionalService();
  assert.throws(
    () => service.validarSesionParaActualizar({ motivo_cancelacion: 'x'.repeat(241) }),
    error => error.statusCode === 400,
  );
});

test('normalizeMotivoCancelacion limpia el motivo si la sesion no esta cancelada', async () => {
  const service = new SesionProfesionalService();
  const entity = { estado: 'completada', motivo_cancelacion: 'El paciente no llego' };
  service.normalizeMotivoCancelacion(entity);
  assert.equal(entity.motivo_cancelacion, null);
});

test('normalizeMotivoCancelacion conserva el motivo si la sesion esta cancelada', async () => {
  const service = new SesionProfesionalService();
  const entity = { estado: 'cancelada', motivo_cancelacion: 'Se reprogramo' };
  service.normalizeMotivoCancelacion(entity);
  assert.equal(entity.motivo_cancelacion, 'Se reprogramo');
});

test('getByProfesionalIdAsync devuelve el has_note que calcula el repositorio', async () => {
  const service = new SesionProfesionalService();
  service.SesionProfesionalRepository = {
    getByProfesionalIdAsync: async (id) => {
      assert.equal(id, 10);
      return [{ id: 1, id_profesional: 10, has_note: true }, { id: 2, id_profesional: 10, has_note: false }];
    },
  };
  const rows = await service.getByProfesionalIdAsync(10);
  assert.deepEqual(rows.map(r => r.has_note), [true, false]);
});
