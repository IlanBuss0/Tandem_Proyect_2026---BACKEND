import assert from 'node:assert/strict';
import test from 'node:test';

import RoutineService from '../src/services/RoutineService.js';
import RoutineRepository from '../src/repositories/RoutineRepository.js';
import BD from '../src/db/BD.js';

// Migracion de "Mi dia" de configuraciones_usuarios (blob JSON gigante,
// clave 'routines.mi-dia') a las tablas rutinas + rutina_items. Estos
// tests cubren la traduccion entre el shape del frontend (DayRoutine/
// RoutineItem en ingles) y las columnas de la tabla (en espanol), y el
// chequeo de dueño antes de un PATCH granular.
function buildService() {
  const service = new RoutineService();
  service.ensureSchemaAsync = async () => {};
  return service;
}

test('getForUsuarioAsync: traduce las columnas de la tabla al shape del frontend', async () => {
  const service = buildService();
  service.RoutineRepository.getForUsuarioAsync = async () => [{
    id: 'r-1', nombre: 'Día escolar', dia_semana: 1, fecha: null,
    items: [{
      id: 'i-1', hora: '08:00', titulo: 'Lavarse los dientes', icono: '🪥', categoria: 'mañana',
      completado: true, reminders: [10], id_pictograma: 'mulberry:teeth', pictograma_url: 'https://x/y.png',
      pictograma_nombre: 'Cepillo', pictograma_confianza: 'alta', pictograma_resuelto_para: 'Lavarse los dientes',
      pictograma_label: 'Dientes',
    }],
  }];

  const [routine] = await service.getForUsuarioAsync(17);

  assert.equal(routine.name, 'Día escolar');
  assert.equal(routine.dayOfWeek, 1);
  assert.equal(routine.items[0].time, '08:00');
  assert.equal(routine.items[0].title, 'Lavarse los dientes');
  assert.equal(routine.items[0].completed, true);
  assert.equal(routine.items[0].pictogramId, 'mulberry:teeth');
  assert.equal(routine.items[0].pictogramImageUrl, 'https://x/y.png');
});

test('replaceAllForUsuarioAsync: traduce del shape del frontend a las columnas antes de guardar', async () => {
  const service = buildService();
  let receivedRoutines = null;
  service.RoutineRepository.replaceAllForUsuarioAsync = async (idUsuario, routines) => { receivedRoutines = routines; };
  service.RoutineRepository.getForUsuarioAsync = async () => [];

  await service.replaceAllForUsuarioAsync(17, [{
    id: 'r-1', name: 'Día escolar', dayOfWeek: 1,
    items: [{ id: 'i-1', time: '08:00', title: 'Comer', icon: '🍽️', category: 'mediodía', completed: false }],
  }]);

  assert.equal(receivedRoutines[0].nombre, 'Día escolar');
  assert.equal(receivedRoutines[0].dia_semana, 1);
  assert.equal(receivedRoutines[0].items[0].hora, '08:00');
  assert.equal(receivedRoutines[0].items[0].titulo, 'Comer');
});

test('updateItemAsync: item de otro usuario tira 404, no llama a updateItemAsync del repositorio', async () => {
  const service = buildService();
  service.RoutineRepository.getItemOwnerUsuarioIdAsync = async () => 5;
  let called = false;
  service.RoutineRepository.updateItemAsync = async () => { called = true; };

  await assert.rejects(() => service.updateItemAsync('i-1', 17, { completed: true }));
  assert.equal(called, false);
});

test('updateItemAsync: item propio traduce el patch y lo aplica', async () => {
  const service = buildService();
  service.RoutineRepository.getItemOwnerUsuarioIdAsync = async () => 17;
  let patchReceived = null;
  service.RoutineRepository.updateItemAsync = async (itemId, patch) => { patchReceived = patch; };

  await service.updateItemAsync('i-1', 17, { completed: true, pictogramId: 'mulberry:teeth' });

  assert.equal(patchReceived.completado, true);
  assert.equal(patchReceived.id_pictograma, 'mulberry:teeth');
});

test('updateItemAsync: item no encontrado (owner null) tira 404', async () => {
  const service = buildService();
  service.RoutineRepository.getItemOwnerUsuarioIdAsync = async () => null;

  await assert.rejects(() => service.updateItemAsync('i-inexistente', 17, { completed: true }));
});

// completedOn: el dia (YYYY-MM-DD, hora local de la persona) en que se completo
// cada paso, para que el frontend lo muestre sin completar al dia siguiente.
async function savedItems(items) {
  const service = buildService();
  let received = null;
  service.RoutineRepository.replaceAllForUsuarioAsync = async (idUsuario, routines) => { received = routines; };
  service.RoutineRepository.getForUsuarioAsync = async () => [];
  await service.replaceAllForUsuarioAsync(17, [{ id: 'r-1', name: 'Mi mañana', dayOfWeek: 1, items }]);
  return received[0].items;
}
const step = (extra) => ({ id: 'i-1', time: '08:00', title: 'Comer', ...extra });

test('completedOn: se guarda como completado_fecha solo si el paso está completo y el formato es YYYY-MM-DD', async () => {
  const [ok, invalidFormat, withTime, notString, notCompleted, withoutDate] = await savedItems([
    step({ completed: true, completedOn: '2026-10-06' }),
    step({ completed: true, completedOn: '06/10/2026' }),
    step({ completed: true, completedOn: '2026-10-06T10:00:00Z' }),
    step({ completed: true, completedOn: 20261006 }),
    step({ completed: false, completedOn: '2026-10-06' }),
    step({ completed: true }),
  ]);
  assert.equal(ok.completado_fecha, '2026-10-06');
  assert.equal(invalidFormat.completado_fecha, null);
  assert.equal(withTime.completado_fecha, null);
  assert.equal(notString.completado_fecha, null);
  assert.equal(notCompleted.completado_fecha, null);
  assert.equal(withoutDate.completado_fecha, null); // frontend viejo: sigue funcionando
  assert.equal(ok.completado, true); // la columna completado se guarda como siempre
});

test('completedOn: ida y vuelta conserva el día; sin fecha o sin completar queda undefined', async () => {
  const [saved] = await savedItems([step({ completed: true, completedOn: '2026-10-06' })]);
  const service = buildService();
  service.RoutineRepository.getForUsuarioAsync = async () => [{
    id: 'r-1', nombre: 'Mi mañana', dia_semana: 1, fecha: null,
    items: [
      { id: 'i-1', hora: '08:00', titulo: 'Comer', completado: true, completado_fecha: saved.completado_fecha },
      { id: 'i-2', hora: '09:00', titulo: 'Viejo', completado: true, completado_fecha: null },
      { id: 'i-3', hora: '10:00', titulo: 'Pendiente', completado: false, completado_fecha: null },
    ],
  }];
  const [routine] = await service.getForUsuarioAsync(17);
  assert.equal(routine.items[0].completedOn, '2026-10-06');
  assert.equal(routine.items[1].completedOn, undefined);
  assert.equal(routine.items[1].completed, true);
  assert.equal(routine.items[2].completedOn, undefined);
});

test('updateItemAsync: completedOn válido se guarda, inválido pasa a null', async () => {
  const service = buildService();
  service.RoutineRepository.getItemOwnerUsuarioIdAsync = async () => 17;
  const patches = [];
  service.RoutineRepository.updateItemAsync = async (itemId, patch) => { patches.push(patch); };
  await service.updateItemAsync('i-1', 17, { completed: true, completedOn: '2026-10-06' });
  await service.updateItemAsync('i-1', 17, { completed: true, completedOn: 'hoy' });
  await service.updateItemAsync('i-1', 17, { completed: true });
  assert.deepEqual([patches[0].completado, patches[0].completado_fecha], [true, '2026-10-06']);
  assert.equal(patches[1].completado_fecha, null);
  assert.equal('completado_fecha' in patches[2], false);
});

test('RoutineRepository: el INSERT masivo de pasos tiene 16 placeholders por fila, incluida completado_fecha', async () => {
  const originalTransaction = BD.transaction;
  const queries = [];
  BD.transaction = async (callback) => callback({ query: async (sql, values) => { queries.push({ sql, values }); return { rows: [] }; } });
  try {
    await new RoutineRepository().replaceAllForUsuarioAsync(17, [{
      id: 'r-1', nombre: 'Mi mañana', dia_semana: 1,
      items: [
        { id: 'i-1', hora: '08:00', titulo: 'Comer', completado: true, completado_fecha: '2026-10-06' },
        { id: 'i-2', hora: '09:00', titulo: 'Lavarse', completado: false },
      ],
    }]);
  } finally {
    BD.transaction = originalTransaction;
  }
  const insert = queries.find((q) => q.sql.includes('INSERT INTO rutina_items'));
  assert.ok(insert.sql.includes('completado_fecha'));
  assert.equal(insert.values.length, 32);
  assert.equal(new Set(insert.sql.match(/\$\d+/g)).size, 32);
  assert.equal(insert.values[8], '2026-10-06');
  assert.equal(insert.values[24], null);
});
