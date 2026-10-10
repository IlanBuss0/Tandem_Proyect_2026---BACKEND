import './helpers/test-env.js';
import assert from 'node:assert/strict';
import test, { beforeEach } from 'node:test';
import { createServer } from 'node:http';
import express from 'express';
import cookieParser from 'cookie-parser';

import BD from '../src/db/BD.js';
import AuthorizationService from '../src/services/AuthorizationService.js';
import AuthorizationRepository from '../src/repositories/AuthorizationRepository.js';
import ConfiguracionAccesibilidadController from '../src/controllers/ConfiguracionAccesibilidadController.js';
import ConfiguracionUsuarioController from '../src/controllers/ConfiguracionUsuarioController.js';
import AuthRepository from '../src/repositories/AuthRepository.js';
import { authMiddleware } from '../src/middlewares/auth.middleware.js';
import { signJwt } from '../src/modules/security/jwt.helper.js';
import { ACCESS_COOKIE_NAME } from '../src/configs/auth-cookies.config.js';
import { errorMiddleware } from '../src/middlewares/error.middleware.js';

// S1: ningun usuario logueado puede leer/escribir/borrar configuraciones de
// otro. Actores: A (10) es perteneciente (id 50), T (30) es su tutor activo,
// B (20) no tiene ningun vinculo con A.
const A = 10;
const B = 20;
const T = 30;

let accesibilidad;
let usuarios;

beforeEach(() => {
  accesibilidad = [
    { id: 1, id_usuario: A, clave: 'fontSize', valor: '1', fecha_modificacion: 'x' },
    { id: 2, id_usuario: B, clave: 'fontSize', valor: '2', fecha_modificacion: 'x' },
  ];
  usuarios = [{ id: 7, id_usuario: A, clave: 'accessibility.settings', valor: '{}', fecha_modificacion: 'x' }];

  BD.query = async () => accesibilidad.slice();
  BD.queryOne = async (sql, params) => {
    if (sql.includes('FROM configuraciones_accesibilidad WHERE id = $1')) return accesibilidad.find((r) => r.id === params[0]) ?? null;
    if (sql.includes('FROM configuraciones_accesibilidad WHERE id_usuario')) return null;
    if (sql.includes('INSERT INTO configuraciones_accesibilidad')) return { id: 99 };
    if (sql.includes('FROM configuraciones_usuarios WHERE id = $1')) return usuarios.find((r) => r.id === params[0]) ?? null;
    if (sql.includes('FROM configuraciones_usuarios WHERE id_usuario')) return null;
    if (sql.includes('INSERT INTO configuraciones_usuarios')) return { id: 98 };
    throw new Error(`SQL no mockeada: ${sql}`);
  };
  BD.execute = async () => 1;
  AuthRepository.findSafeById = async (id) => ({ id, activo: true });

  AuthorizationRepository.getUsuarioById = async (id) => ({ id, activo: true });
  AuthorizationRepository.getPertenecienteByUsuarioId = async (id) => (id === A ? { id: 50, id_usuario: A } : null);
  AuthorizationRepository.getTutorByUsuarioId = async (id) => (id === T ? { id: 3 } : null);
  AuthorizationRepository.getProfesionalByUsuarioId = async () => null;
  AuthorizationRepository.isTutorActivoForPerteneciente = async (idTutor, idPerteneciente) => idTutor === 3 && idPerteneciente === 50;
  AuthorizationService.getPermissionContext = async (id) => ({
    pertenecientes: id === T ? [{ usuario: { id: A } }] : [],
    vinculos: [],
  });
});

function appAs() {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api', authMiddleware);
  app.use('/api/configuraciones-accesibilidad', ConfiguracionAccesibilidadController);
  app.use('/api/configuraciones-usuarios', ConfiguracionUsuarioController);
  app.use(errorMiddleware);
  return app;
}

async function call(idUsuario, method, path, body) {
  const server = createServer(appAs());
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}${path}`, {
      method,
      headers: { 'content-type': 'application/json', cookie: `${ACCESS_COOKIE_NAME}=${signJwt({ id: idUsuario })}` },
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await response.text();
    return { status: response.status, text, json: () => JSON.parse(text) };
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

const ACC = '/api/configuraciones-accesibilidad';
const USR = '/api/configuraciones-usuarios';
const newAcc = (idUsuario) => ({ id_usuario: idUsuario, clave: 'fontSize', valor: '3', fecha_modificacion: 'x' });

test('accesibilidad GET todos: cada uno ve solo sus filas; el tutor ve las de su perteneciente', async () => {
  assert.deepEqual((await call(A, 'GET', ACC)).json().map((r) => r.id), [1]);
  assert.deepEqual((await call(B, 'GET', ACC)).json().map((r) => r.id), [2]);
  assert.deepEqual((await call(T, 'GET', ACC)).json().map((r) => r.id), [1]);
});

test('accesibilidad GET /:id: dueño y tutor leen, otro usuario 403 sin filtrar datos', async () => {
  assert.equal((await call(A, 'GET', `${ACC}/1`)).status, 200);
  assert.equal((await call(T, 'GET', `${ACC}/1`)).status, 200);
  const denied = await call(B, 'GET', `${ACC}/1`);
  assert.equal(denied.status, 403);
  assert.ok(!denied.text.includes('fontSize'));
  assert.equal((await call(A, 'GET', `${ACC}/999`)).status, 404);
});

test('accesibilidad POST: dueño y tutor crean; otro usuario 403', async () => {
  assert.equal((await call(A, 'POST', ACC, newAcc(A))).status, 201);
  assert.equal((await call(T, 'POST', ACC, newAcc(A))).status, 201);
  assert.equal((await call(B, 'POST', ACC, newAcc(A))).status, 403);
});

test('accesibilidad POST: un usuario sin perfil de perteneciente escribe lo suyo y no lo ajeno', async () => {
  assert.equal((await call(B, 'POST', ACC, newAcc(B))).status, 201);
  assert.equal((await call(B, 'POST', ACC, newAcc(T))).status, 403);
});

test('accesibilidad PUT: dueño y tutor editan; otro 403; el id_usuario del body no cuenta', async () => {
  assert.equal((await call(A, 'PUT', `${ACC}/1`, newAcc(A))).status, 200);
  assert.equal((await call(T, 'PUT', `${ACC}/1`, newAcc(A))).status, 200);
  // B se hace pasar por dueño en el body de la fila de A: igual 403
  assert.equal((await call(B, 'PUT', `${ACC}/1`, newAcc(B))).status, 403);
  assert.equal((await call(A, 'PUT', `${ACC}/999`, newAcc(A))).status, 404);
});

test('accesibilidad DELETE: dueño y tutor borran; otro 403', async () => {
  assert.equal((await call(B, 'DELETE', `${ACC}/1`)).status, 403);
  assert.equal((await call(A, 'DELETE', `${ACC}/1`)).status, 200);
  assert.equal((await call(T, 'DELETE', `${ACC}/1`)).status, 200);
  assert.equal((await call(A, 'DELETE', `${ACC}/999`)).status, 404);
});

test('configuraciones-usuarios: accessibility.settings de otro sin vinculo -> 403 (POST/PUT/DELETE)', async () => {
  const body = { id_usuario: A, clave: 'accessibility.settings', valor: '{}', fecha_modificacion: 'x' };
  assert.equal((await call(B, 'POST', USR, body)).status, 403);
  assert.equal((await call(B, 'PUT', `${USR}/7`, { ...body, id_usuario: B })).status, 403);
  assert.equal((await call(B, 'DELETE', `${USR}/7`)).status, 403);
});

test('configuraciones-usuarios: accessibility.settings lo escriben el dueño y su tutor', async () => {
  const body = { id_usuario: A, clave: 'accessibility.settings', valor: '{}', fecha_modificacion: 'x' };
  assert.equal((await call(A, 'POST', USR, body)).status, 201);
  assert.equal((await call(T, 'POST', USR, body)).status, 201);
  assert.equal((await call(T, 'PUT', `${USR}/7`, body)).status, 200);
  assert.equal((await call(A, 'DELETE', `${USR}/7`)).status, 200);
});
