import './helpers/test-env.js';
import assert from 'node:assert/strict';
import test, { beforeEach } from 'node:test';
import { createServer } from 'node:http';
import express from 'express';
import cookieParser from 'cookie-parser';

import BD from '../src/db/BD.js';
import AuthorizationRepository from '../src/repositories/AuthorizationRepository.js';
import AuthRepository from '../src/repositories/AuthRepository.js';
import TarjetaAyudaRepository from '../src/repositories/TarjetaAyudaRepository.js';
import TarjetaAyudaController, { publicTarjetaAyudaRouter } from '../src/controllers/TarjetaAyudaController.js';
import { publicTarjetaRateLimiter } from '../src/middlewares/rate-limit.middleware.js';
import { errorMiddleware } from '../src/middlewares/error.middleware.js';
import { signJwt } from '../src/modules/security/jwt.helper.js';
import { ACCESS_COOKIE_NAME } from '../src/configs/auth-cookies.config.js';

// Actores: P (10) es el perteneciente 50; T (30) su tutor activo; T2 (31) tutor
// sin vinculo; PRO (40) profesional. Los tutores que figuran en la tarjeta
// (ids 60 y 61) son los destinatarios de los avisos.
const P = 10;
const T = 30;
const T2 = 31;
const PRO = 40;

const TOKEN_50 = 'a'.repeat(64);
const TOKEN_51 = 'b'.repeat(64);
const TOKEN_52 = 'c'.repeat(64);

const CONTACTS = {
  50: [
    { id_usuario: 60, nombre: 'Ana', apellido: 'Perez', parentesco: 'Madre', telefono: '1155551234', correo: 'ana@mail.com', es_tutor_principal: true },
    { id_usuario: 61, nombre: 'Luis', apellido: 'Perez', parentesco: null, telefono: null, correo: 'luis@mail.com', es_tutor_principal: false },
  ],
  51: [{ id_usuario: 60, nombre: 'Ana', apellido: 'Perez', parentesco: 'Madre', telefono: '1155551234', correo: null, es_tutor_principal: true },
    { id_usuario: 61, nombre: 'Luis', apellido: 'Perez', parentesco: null, telefono: null, correo: null, es_tutor_principal: false }],
  52: [{ id_usuario: 60, nombre: 'Ana', apellido: 'Perez', parentesco: 'Madre', telefono: '1155551234', correo: null, es_tutor_principal: true }],
};

let cards;
let notifications;
let contactSql;
let failNotifications;

const baseCard = (id, token, overrides = {}) => ({
  id_perteneciente: id,
  activa: true,
  token,
  mostrar_celular: true,
  mostrar_mail: false,
  mostrar_domicilio: false,
  domicilio: 'Calle Falsa 123',
  mensaje: null,
  fecha_modificacion: new Date(),
  ...overrides,
});

beforeEach(() => {
  cards = new Map();
  notifications = [];
  contactSql = [];
  failNotifications = false;

  // Repositorio de la tarjeta en memoria (metodos de prototipo, patchables).
  TarjetaAyudaRepository.prototype.ensureSchemaAsync = async () => {};
  TarjetaAyudaRepository.prototype.getByPertenecienteIdAsync = async (id) => cards.get(id) ?? null;
  TarjetaAyudaRepository.prototype.createIfMissingAsync = async (id, token) => {
    if (!cards.has(id)) cards.set(id, baseCard(id, token, { activa: false, mostrar_mail: false, domicilio: null }));
  };
  TarjetaAyudaRepository.prototype.updateAsync = async (id, data) => {
    Object.assign(cards.get(id), {
      activa: data.activa,
      mostrar_celular: data.mostrarCelular,
      mostrar_mail: data.mostrarMail,
      mostrar_domicilio: data.mostrarDomicilio,
      domicilio: data.domicilio,
      mensaje: data.mensaje,
    });
    return 1;
  };
  TarjetaAyudaRepository.prototype.updateTokenAsync = async (id, token) => { cards.get(id).token = token; return 1; };
  TarjetaAyudaRepository.prototype.getActiveByTokenAsync = async (token) => {
    const card = [...cards.values()].find((c) => c.token === token && c.activa);
    return card ? { ...card, id_usuario: P, nombre: 'Mateo Julian', apellido: 'Gomez' } : null;
  };
  TarjetaAyudaRepository.prototype.getPertenecienteNombreAsync = async () => ({ id_usuario: P, nombre: 'Mateo Julian', apellido: 'Gomez' });

  BD.query = async (sql, params) => {
    if (sql.includes('tutores_activos')) { contactSql.push(sql); return CONTACTS[params[0]] ?? []; }
    throw new Error(`SQL no mockeada: ${sql}`);
  };
  BD.queryOne = async (sql, params) => {
    if (sql.includes('FROM tipos_notificaciones')) return { id: 1 };
    if (sql.includes('INSERT INTO notificaciones')) {
      if (failNotifications) throw new Error('boom');
      notifications.push(params);
      return { id: notifications.length };
    }
    throw new Error(`SQL no mockeada: ${sql}`);
  };

  AuthRepository.findSafeById = async (id) => ({ id, activo: true });
  AuthorizationRepository.getUsuarioById = async (id) => ({ id, activo: true });
  AuthorizationRepository.getPertenecienteByUsuarioId = async (id) => (id === P ? { id: 50, id_usuario: P } : null);
  AuthorizationRepository.getTutorByUsuarioId = async (id) => ({ [T]: { id: 3 }, [T2]: { id: 4 } })[id] ?? null;
  AuthorizationRepository.getProfesionalByUsuarioId = async (id) => (id === PRO ? { id: 8 } : null);
  AuthorizationRepository.isTutorActivoForPerteneciente = async (idTutor, idPerteneciente) => idTutor === 3 && idPerteneciente === 50;
});

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api/public/tarjeta', publicTarjetaAyudaRouter);
  app.use('/api/tarjeta-ayuda', TarjetaAyudaController);
  app.use(errorMiddleware);
  return app;
}

async function call(idUsuario, method, path, body, app = buildApp()) {
  const server = createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const headers = { 'content-type': 'application/json' };
    if (idUsuario) headers.cookie = `${ACCESS_COOKIE_NAME}=${signJwt({ id: idUsuario })}`;
    const response = await fetch(`http://127.0.0.1:${server.address().port}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await response.text();
    return { status: response.status, headers: response.headers, text, json: () => JSON.parse(text) };
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

const CARD = '/api/tarjeta-ayuda/perteneciente/50';
const PUB = (token) => `/api/public/tarjeta/${token}`;
const config = (overrides = {}) => ({ activa: true, mostrarCelular: true, mostrarMail: false, mostrarDomicilio: false, ...overrides });
const settle = () => new Promise((resolve) => setTimeout(resolve, 30));

test('permisos: solo el tutor con vinculo activo configura; perteneciente, otro tutor y profesional -> 403', async () => {
  for (const actor of [P, T2, PRO]) {
    assert.equal((await call(actor, 'GET', CARD)).status, 403, `GET actor ${actor}`);
    assert.equal((await call(actor, 'PUT', CARD, config())).status, 403, `PUT actor ${actor}`);
    assert.equal((await call(actor, 'POST', `${CARD}/regenerar`)).status, 403, `POST actor ${actor}`);
  }
  assert.equal(cards.size, 0, 'un actor sin permiso no debe crear la tarjeta');
  assert.equal((await call(T, 'GET', '/api/tarjeta-ayuda/mia')).status, 403);
  assert.equal((await call(PRO, 'GET', '/api/tarjeta-ayuda/mia')).status, 403);
});

test('rutas con sesion: sin cookie 401; la publica no la pide', async () => {
  assert.equal((await call(null, 'GET', '/api/tarjeta-ayuda/mia')).status, 401);
  assert.equal((await call(null, 'GET', CARD)).status, 401);
  assert.equal((await call(null, 'GET', PUB('f'.repeat(64)))).status, 404);
});

test('tutor: GET crea la tarjeta apagada y devuelve url y vista previa de tutores', async () => {
  const response = await call(T, 'GET', CARD);
  assert.equal(response.status, 200);
  const body = response.json();
  assert.equal(body.activa, false);
  assert.match(body.url, /^\/tarjeta\/[0-9a-f]{64}$/);
  assert.deepEqual(body.tutores.map((t) => [t.nombre, t.esTutorPrincipal, t.tieneCelular, t.tieneMail]), [
    ['Ana', true, true, true],
    ['Luis', false, false, true],
  ]);
  assert.equal((await call(T, 'GET', '/api/tarjeta-ayuda/perteneciente/abc')).status, 400);
});

test('perteneciente: /mia devuelve activa, url, nombre y apellido sin datos de tutores', async () => {
  const response = await call(P, 'GET', '/api/tarjeta-ayuda/mia');
  assert.equal(response.status, 200);
  const body = response.json();
  assert.deepEqual(Object.keys(body).sort(), ['activa', 'apellido', 'nombre', 'url']);
  assert.match(body.url, /^\/tarjeta\/[0-9a-f]{64}$/);
});

test('publica: token mal formado, inexistente o tarjeta apagada -> mismo 404 generico', async () => {
  cards.set(50, baseCard(50, TOKEN_50, { activa: false }));
  const responses = [
    await call(null, 'GET', PUB('abc')),
    await call(null, 'GET', PUB('z'.repeat(64))),
    await call(null, 'GET', PUB('f'.repeat(64))),
    await call(null, 'GET', PUB(TOKEN_50)),
  ];
  for (const r of responses) {
    assert.equal(r.status, 404);
    assert.equal(r.text, responses[0].text);
    assert.equal(r.headers.get('cache-control'), 'no-store');
    assert.equal(r.headers.get('x-robots-tag'), 'noindex');
  }
  assert.equal(notifications.length, 0);
});

test('publica: respeta mostrar celular / mail / domicilio y no expone ids', async () => {
  cards.set(50, baseCard(50, TOKEN_50, { mensaje: 'Soy sordo' }));
  const ok = await call(null, 'GET', PUB(TOKEN_50));
  assert.equal(ok.status, 200);
  assert.equal(ok.headers.get('cache-control'), 'no-store');
  assert.equal(ok.headers.get('x-robots-tag'), 'noindex');
  assert.deepEqual(ok.json(), {
    nombre: 'Mateo Julian',
    apellido: 'Gomez',
    mensaje: 'Soy sordo',
    tutores: [
      { nombre: 'Ana', apellido: 'Perez', parentesco: 'Madre', celular: '1155551234' },
      { nombre: 'Luis', apellido: 'Perez' },
    ],
  });

  const all = { mostrarCelular: false, mostrarMail: true, mostrarDomicilio: true, domicilio: 'Calle Falsa 123' };
  assert.equal((await call(T, 'PUT', CARD, config(all))).status, 200);
  assert.deepEqual((await call(null, 'GET', PUB(TOKEN_50))).json(), {
    nombre: 'Mateo Julian',
    apellido: 'Gomez',
    domicilio: 'Calle Falsa 123',
    tutores: [
      { nombre: 'Ana', apellido: 'Perez', parentesco: 'Madre', mail: 'ana@mail.com' },
      { nombre: 'Luis', apellido: 'Perez', mail: 'luis@mail.com' },
    ],
  });

  assert.equal((await call(T, 'PUT', CARD, config({ mostrarDomicilio: false, domicilio: 'Calle Falsa 123' }))).status, 200);
  assert.equal('domicilio' in (await call(null, 'GET', PUB(TOKEN_50))).json(), false);
});

test('publica: solo tutores activos (la consulta no toca profesionales)', async () => {
  cards.set(50, baseCard(50, TOKEN_50));
  await call(null, 'GET', PUB(TOKEN_50));
  assert.ok(contactSql.length > 0);
  for (const sql of contactSql) {
    assert.match(sql, /vinculos_tutor_pertenecientes/);
    assert.doesNotMatch(sql, /profesional/i);
  }
});

test('regenerar: el token viejo deja de funcionar y el nuevo funciona', async () => {
  cards.set(50, baseCard(50, TOKEN_50));
  assert.equal((await call(null, 'GET', PUB(TOKEN_50))).status, 200);

  const regenerated = await call(T, 'POST', `${CARD}/regenerar`);
  assert.equal(regenerated.status, 200);
  const { url } = regenerated.json();
  assert.notEqual(url, `/tarjeta/${TOKEN_50}`);

  assert.equal((await call(null, 'GET', PUB(TOKEN_50))).status, 404);
  assert.equal((await call(null, 'GET', PUB(url.replace('/tarjeta/', '')))).status, 200);
});

test('PUT: validaciones de tipos, largos y limpieza de texto', async () => {
  for (const field of ['activa', 'mostrarCelular', 'mostrarMail', 'mostrarDomicilio']) {
    assert.equal((await call(T, 'PUT', CARD, config({ [field]: 'true' }))).status, 400, field);
    const missing = config();
    delete missing[field];
    assert.equal((await call(T, 'PUT', CARD, missing)).status, 400, `falta ${field}`);
  }
  assert.equal((await call(T, 'PUT', CARD, config({ domicilio: 'x'.repeat(161) }))).status, 400);
  assert.equal((await call(T, 'PUT', CARD, config({ mensaje: 'x'.repeat(201) }))).status, 400);
  assert.equal((await call(T, 'PUT', CARD, config({ domicilio: 123 }))).status, 400);
  assert.equal((await call(T, 'PUT', CARD, config({ domicilio: 'x'.repeat(160), mensaje: 'y'.repeat(200) }))).status, 200);

  const cleaned = await call(T, 'PUT', CARD, config({ domicilio: '  Calle \u0000  1\n23\t ', mensaje: '   ' }));
  assert.equal(cleaned.status, 200);
  assert.equal(cleaned.json().domicilio, 'Calle 1 23');
  assert.equal(cleaned.json().mensaje, null);
});

test('aviso de escaneo: una alerta por tutor y como mucho una cada 10 minutos', async () => {
  cards.set(51, baseCard(51, TOKEN_51));
  assert.equal((await call(null, 'GET', PUB(TOKEN_51))).status, 200);
  await settle();
  assert.equal(notifications.length, 2);
  const [first] = notifications;
  // [destino, actor, tipo, titulo, cuerpo, leida, fecha, fecha_lectura, reference_type, reference_id, context_user_id]
  assert.equal(first[0], 60);
  assert.equal(first[1], null);
  assert.equal(first[3], 'Abrieron la tarjeta de ayuda de Mateo');
  assert.equal(first[4], 'Alguien escaneó su código QR. Puede que te llamen.');
  assert.equal(first[8], 'help_card_scan');
  assert.equal(first[9], 51);
  assert.equal(notifications[1][0], 61);

  for (let i = 0; i < 3; i += 1) await call(null, 'GET', PUB(TOKEN_51));
  await settle();
  assert.equal(notifications.length, 2, 'las recargas no generan avisos nuevos');
});

test('aviso de escaneo: si falla, la pagina igual responde', async () => {
  cards.set(52, baseCard(52, TOKEN_52));
  failNotifications = true;
  const response = await call(null, 'GET', PUB(TOKEN_52));
  await settle();
  assert.equal(response.status, 200);
  assert.equal(response.json().tutores.length, 1);
});

test('rate limiter publico: 30 pedidos por minuto, el 31 recibe 429', async () => {
  const app = express();
  app.use('/api/public/tarjeta', publicTarjetaRateLimiter, publicTarjetaAyudaRouter);
  app.use(errorMiddleware);
  const server = createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const url = `http://127.0.0.1:${server.address().port}${PUB('f'.repeat(64))}`;
    for (let i = 0; i < 30; i += 1) assert.equal((await fetch(url)).status, 404);
    assert.equal((await fetch(url)).status, 429);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
