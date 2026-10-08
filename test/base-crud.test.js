import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import express from 'express';
import BD from '../src/db/BD.js';
import BaseCrudController from '../src/controllers/base/BaseCrudController.js';
import TipoActividadController from '../src/controllers/TipoActividadController.js';
import DificultadActividadController from '../src/controllers/DificultadActividadController.js';
import BaseCrudService from '../src/services/base/BaseCrudService.js';
import TipoActividadRepository from '../src/repositories/TipoActividadRepository.js';
import DificultadActividadRepository from '../src/repositories/DificultadActividadRepository.js';
import TipoChatRepository from '../src/repositories/TipoChatRepository.js';
import ConfiguracionUsuarioRepository from '../src/repositories/ConfiguracionUsuarioRepository.js';
import ConfiguracionAccesibilidadRepository from '../src/repositories/ConfiguracionAccesibilidadRepository.js';
import BaseCrudRepository from '../src/repositories/base/BaseCrudRepository.js';
import TipoActividadService from '../src/services/TipoActividadService.js';
import TipoActividad from '../src/entities/TipoActividad.js';
import DificultadActividad from '../src/entities/DificultadActividad.js';

const original = { query: BD.query, queryOne: BD.queryOne, execute: BD.execute };
after(() => Object.assign(BD, original));

for (const [Repository, table] of [
  [TipoActividadRepository, 'tipos_actividades'],
  [DificultadActividadRepository, 'dificultades_actividades'],
]) {
  test(`${Repository.name} conserva SQL y retornos CRUD`, async () => {
    const calls = [];
    BD.query = async (...args) => { calls.push(args); return [{ id: 2 }]; };
    BD.queryOne = async (...args) => {
      calls.push(args);
      if (args[0].startsWith('INSERT')) return { id: 9 };
      return { id: 2, nombre: 'Anterior', orden: 4 };
    };
    BD.execute = async (...args) => { calls.push(args); return 1; };
    const repository = new Repository();

    assert.deepEqual(await repository.getAllAsync(), [{ id: 2 }]);
    assert.deepEqual(calls.pop(), [`SELECT id, nombre, orden FROM ${table} ORDER BY id DESC`]);
    assert.deepEqual(await repository.getByIdAsync(2), { id: 2, nombre: 'Anterior', orden: 4 });
    assert.deepEqual(calls.pop(), [`SELECT id, nombre, orden FROM ${table} WHERE id = $1`, [2]]);
    assert.equal(await repository.createAsync({ nombre: '', orden: 0 }), 9);
    assert.deepEqual(calls.pop(), [`INSERT INTO ${table} (nombre, orden) VALUES ($1, $2) RETURNING id`, ['', 0]]);
    assert.equal(await repository.createAsync({ nombre: null }), 9);
    assert.deepEqual(calls.pop()[1], [null, null]);
    assert.equal(await repository.createAsync({ nombre: false, orden: 0 }), 9);
    assert.deepEqual(calls.pop()[1], [false, 0]);
    assert.equal(await repository.updateAsync({ id: 2, nombre: null, orden: 0 }), 1);
    assert.deepEqual(calls.pop(), [`UPDATE ${table} SET nombre = $2, orden = $3 WHERE id = $1`, [2, 'Anterior', 0]]);
    assert.equal(await repository.updateAsync({ id: 2, nombre: '' }), 1);
    assert.deepEqual(calls.pop()[1], [2, '', 4]);
    assert.equal(await repository.deleteByIdAsync(2), 1);
    assert.deepEqual(calls.pop(), [`DELETE FROM ${table} WHERE id = $1`, [2]]);

    BD.queryOne = async () => null;
    assert.equal(await repository.getByIdAsync(99), null);
    assert.equal(await repository.updateAsync({ id: 99 }), 0);
    assert.equal(await repository.createAsync({}), 0);
  });
}

test('entidades concretas y service conservan nombre y dependencia reemplazable', async () => {
  assert.equal(new TipoActividad({ nombre: 'x', orden: false }).orden, false);
  assert.equal(new DificultadActividad({ nombre: 'x' }).id, null);
  const service = new TipoActividadService();
  assert.equal(service.constructor.name, 'TipoActividadService');
  service.TipoActividadRepository = {
    getAllAsync: async () => null,
    getByIdAsync: async () => null,
    createAsync: async () => 3,
    updateAsync: async () => 0,
    deleteByIdAsync: async () => 1,
  };
  assert.equal(await service.getAllAsync(), null);
  assert.equal(await service.getByIdAsync(1), null);
  assert.equal(await service.createAsync({}), 3);
  assert.equal(await service.updateAsync({}), 0);
  assert.equal(await service.deleteByIdAsync(1), 1);
  service.TipoActividadRepository.getAllAsync = async () => undefined;
  assert.equal(await service.getAllAsync(), null);
  service.TipoActividadRepository.getAllAsync = async () => false;
  assert.equal(await service.getAllAsync(), false);
  assert.equal(new BaseCrudService(service.TipoActividadRepository, 'repository').repository, service.TipoActividadRepository);
});

test('TipoChat conserva la consulta especifica por nombre', async () => {
  const calls = [];
  BD.queryOne = async (...args) => { calls.push(args); return { id: 3 }; };
  assert.deepEqual(await new TipoChatRepository().getByNombreAsync('DIRECTO'), { id: 3 });
  assert.deepEqual(calls[0], [
    'SELECT id, nombre, orden FROM tipos_chats WHERE LOWER(nombre) = LOWER($1)',
    ['DIRECTO'],
  ]);
});

for (const [Repository, table] of [
  [ConfiguracionUsuarioRepository, 'configuraciones_usuarios'],
  [ConfiguracionAccesibilidadRepository, 'configuraciones_accesibilidad'],
]) {
  test(`${Repository.name} conserva consultas y valores ausentes`, async () => {
    const calls = [];
    BD.query = async (...args) => { calls.push(args); return []; };
    BD.queryOne = async (...args) => {
      calls.push(args);
      return args[0].startsWith('INSERT')
        ? { id: 4 }
        : { id: 2, id_usuario: 5, clave: 'tema', valor: false, fecha_modificacion: 'ayer' };
    };
    BD.execute = async (...args) => { calls.push(args); return 1; };
    const repository = new Repository();
    await repository.getByUsuarioIdAsync(5);
    assert.deepEqual(calls.pop(), [
      `SELECT id, id_usuario, clave, valor, fecha_modificacion FROM ${table} WHERE id_usuario = $1 ORDER BY clave ASC`,
      [5],
    ]);
    await repository.getByUsuarioAndClaveAsync(5, 'tema');
    assert.deepEqual(calls.pop(), [
      `SELECT id, id_usuario, clave, valor, fecha_modificacion FROM ${table} WHERE id_usuario = $1 AND clave = $2`,
      [5, 'tema'],
    ]);
    assert.equal(await repository.createAsync({ id_usuario: 5, clave: '', valor: false }), 4);
    assert.deepEqual(calls.pop()[1], [5, '', false, undefined]);
    assert.equal(await repository.updateAsync({ id: 2, id_usuario: 0, valor: null }), 1);
    assert.deepEqual(calls.pop()[1], [2, 0, 'tema', false, 'ayer']);
  });
}

test('BaseCrudRepository rechaza identificadores SQL fuera de la configuracion', () => {
  assert.throws(() => new BaseCrudRepository({
    table: 'tipos_actividades; DROP TABLE usuarios',
    selectColumns: ['id'],
    insertColumns: ['nombre'],
    updateColumns: ['nombre'],
  }), /Identificador SQL invalido/);
});

test('controller conserva rutas, status y formatos', async () => {
  const service = {
    getAllAsync: async () => [],
    getByIdAsync: async (id) => id === 1 ? { id } : null,
    createAsync: async () => 3,
    updateAsync: async (entity) => entity.id === 1 ? 1 : 0,
    deleteByIdAsync: async (id) => id === 1 ? 1 : 0,
  };
  const app = express();
  app.use(express.json());
  app.use('/items', new BaseCrudController(service, TipoActividad).router);
  const server = app.listen(0);
  const base = `http://127.0.0.1:${server.address().port}/items`;
  const request = async (path = '', options = {}) => {
    const response = await fetch(base + path, options);
    return { status: response.status, body: await response.text() };
  };
  try {
    assert.deepEqual(await request(), { status: 200, body: '[]' });
    assert.deepEqual(await request('/1'), { status: 200, body: '{"id":1}' });
    assert.equal((await request('/2')).status, 404);
    assert.deepEqual(await request('', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"nombre":"x"}' }), { status: 201, body: '{"id":3}' });
    assert.deepEqual(await request('/1', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: '{"nombre":"x"}' }), { status: 200, body: '{"rowsAffected":1}' });
    assert.equal((await request('/2', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status, 404);
    assert.deepEqual(await request('/1', { method: 'DELETE' }), { status: 200, body: '{"rowsAffected":1}' });
    assert.equal((await request('/2', { method: 'DELETE' })).status, 404);
  } finally {
    server.close();
  }
});

test('routers concretos del piloto conservan el montaje HTTP', async () => {
  BD.query = async () => [{ id: 1, nombre: 'Facil', orden: 1 }];
  const app = express();
  app.use('/api/tipos-actividades', TipoActividadController);
  app.use('/api/dificultades-actividades', DificultadActividadController);
  const server = app.listen(0);
  try {
    for (const path of ['/api/tipos-actividades', '/api/dificultades-actividades']) {
      const response = await fetch(`http://127.0.0.1:${server.address().port}${path}`);
      assert.equal(response.status, 200);
      assert.deepEqual(await response.json(), [{ id: 1, nombre: 'Facil', orden: 1 }]);
    }
  } finally {
    server.close();
  }
});
