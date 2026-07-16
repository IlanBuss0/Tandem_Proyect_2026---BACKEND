import test from 'node:test';
import assert from 'node:assert/strict';
import SesionProfesionalService from '../src/services/SesionProfesionalService.js';
import PerfilProfesionalService from '../src/services/PerfilProfesionalService.js';

test('una nota privada no puede ser leida por otro profesional', async () => {
  const service = new SesionProfesionalService();
  service.SesionProfesionalRepository = {
    getByIdAsync: async () => ({ id: 7, id_profesional: 10 }),
  };
  await assert.rejects(() => service.getPrivateNoteAsync(7, 11), error => error.statusCode === 403);
});

test('el contenido de la nota exige documento JSON valido', async () => {
  const service = new SesionProfesionalService();
  service.SesionProfesionalRepository = { getByIdAsync: async () => ({ id: 7, id_profesional: 10 }) };
  await assert.rejects(() => service.savePrivateNoteAsync(7, 10, { type: 'html' }), error => error.statusCode === 400);
});

test('Drive deriva una URL de Google Docs y no confia en la URL recibida', async () => {
  const service = new SesionProfesionalService();
  let saved;
  service.getPrivateNoteAsync = async () => ({ id: 3 });
  service.SesionProfesionalRepository = {
    upsertDriveDocumentAsync: async (_id, document) => { saved = document; return document; },
  };
  await service.linkDriveDocumentAsync(7, 10, {
    google_file_id: 'AbCdEfGhIjKlMnOp', nombre: 'Ficha', web_view_url: 'https://evil.example',
  });
  assert.equal(saved.web_view_url, 'https://docs.google.com/document/d/AbCdEfGhIjKlMnOp/edit');
  assert.equal(saved.mime_type, 'application/vnd.google-apps.document');
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
