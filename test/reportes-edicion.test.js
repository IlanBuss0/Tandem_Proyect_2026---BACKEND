import test from 'node:test';
import assert from 'node:assert/strict';
import ReporteProfesionalService from '../src/services/ReporteProfesionalService.js';

function serviceWith(reporte) {
  const service = new ReporteProfesionalService();
  const calls = { updated: null, deleted: null };
  service.ReporteProfesionalRepository = {
    getByIdAsync: async (id) => (reporte && Number(id) === reporte.id ? reporte : null),
    updateAsync: async (id, changes) => { calls.updated = { id, changes }; return { ...reporte, ...changes }; },
    deleteAsync: async (id) => { calls.deleted = id; },
  };
  return { service, calls };
}

const propio = { id: 7, id_profesional: 10, id_perteneciente: 5, titulo: 'Reporte', contenido: 'texto', enviado_al_tutor: false };

test('updateAsync edita titulo y contenido de un reporte propio sin enviar', async () => {
  const { service, calls } = serviceWith(propio);
  const result = await service.updateAsync(7, 10, { titulo: '  Nuevo titulo ', contenido: 'Texto corregido' });
  assert.deepEqual(calls.updated, { id: 7, changes: { titulo: 'Nuevo titulo', contenido: 'Texto corregido' } });
  assert.equal(result.contenido, 'Texto corregido');
});

test('updateAsync valida los datos y rechaza reportes ajenos, inexistentes o ya enviados', async () => {
  const { service } = serviceWith(propio);
  await assert.rejects(() => service.updateAsync(7, 10, {}), (error) => error.statusCode === 400);
  await assert.rejects(() => service.updateAsync(7, 10, { contenido: '   ' }), (error) => error.statusCode === 400);
  await assert.rejects(() => service.updateAsync(7, 10, { titulo: 'x'.repeat(201) }), (error) => error.statusCode === 400);
  await assert.rejects(() => service.updateAsync(7, 99, { contenido: 'a' }), (error) => error.statusCode === 403);
  await assert.rejects(() => service.updateAsync(8, 10, { contenido: 'a' }), (error) => error.statusCode === 404);
  await assert.rejects(() => service.updateAsync(NaN, 10, { contenido: 'a' }), (error) => error.statusCode === 400);
  const enviado = serviceWith({ ...propio, enviado_al_tutor: true });
  await assert.rejects(() => enviado.service.updateAsync(7, 10, { contenido: 'a' }), (error) => error.statusCode === 409);
  assert.equal(enviado.calls.updated, null);
});

test('deleteAsync borra solo reportes propios', async () => {
  const { service, calls } = serviceWith(propio);
  await assert.rejects(() => service.deleteAsync(7, 99), (error) => error.statusCode === 403);
  assert.equal(calls.deleted, null);
  await assert.rejects(() => service.deleteAsync(8, 10), (error) => error.statusCode === 404);
  assert.deepEqual(await service.deleteAsync(7, 10), { rowsAffected: 1 });
  assert.equal(calls.deleted, 7);
});
