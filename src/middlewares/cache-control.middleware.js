// Cabeceras HTTP de cache para respuestas GET/HEAD.
//
// - Datos personales: "private, no-cache" -> el navegador puede guardar la
//   respuesta pero tiene que revalidarla siempre (Express ya agrega ETag, asi
//   que si no cambio responde 304 sin cuerpo).
// - Catalogos globales: "private, max-age=300" -> el navegador los reusa 5
//   minutos sin preguntar.
// Nunca "public": ningun CDN/proxy intermedio debe guardar respuestas de la
// API. Si un handler fija su propia cabecera (p. ej. "no-store" en la tarjeta
// publica o en refeps) la suya pisa a esta, porque se setea despues.

export const PRIVATE_REVALIDATE = 'private, no-cache';
export const CATALOG_MAX_AGE_SECONDS = 300;

function isReadRequest(req) {
  return req.method === 'GET' || req.method === 'HEAD';
}

export function privateNoCache(req, res, next) {
  if (isReadRequest(req)) res.set('Cache-Control', PRIVATE_REVALIDATE);
  next();
}

export function catalogCache(maxAgeSeconds = CATALOG_MAX_AGE_SECONDS) {
  const value = `private, max-age=${maxAgeSeconds}`;
  return function catalogCacheControl(req, res, next) {
    if (isReadRequest(req)) res.set('Cache-Control', value);
    next();
  };
}

// Rutas (bajo /api) que sirven catalogos globales que no dependen del usuario.
export const CATALOG_ROUTE_PREFIXES = Object.freeze([
  '/api/niveles-apoyos',
  '/api/autonomias-operativas',
  '/api/dificultades-actividades',
  '/api/estados-actividades',
  '/api/estados-contactos',
  '/api/estados-pagos',
  '/api/estados-reportes',
  '/api/estados-suscripciones',
  '/api/estados-validaciones-profesionales',
  '/api/estados-vinculos',
  '/api/puntos-otorgados',
  '/api/catalogos-permisos-pertenecientes',
  '/api/catalogos-permisos-profesionales',
  '/api/tipos-actividades',
  '/api/tipos-archivos',
  '/api/tipos-chats',
  '/api/tipos-eventos-auditorias',
  '/api/tipos-eventos-zonas-seguras',
  '/api/tipos-items-avatares',
  '/api/tipos-mensajes',
  '/api/tipos-movimientos-puntos',
  '/api/tipos-notificaciones',
  '/api/tipos-permisos-archivos',
  '/api/tipos-usuarios',
]);

// Catalogos publicos de pictogramas (montados antes de authMiddleware).
export const PUBLIC_PICTOGRAM_CATALOG_PREFIXES = Object.freeze(
  ['/api/pictogramas', '/api/pictograms', '/pictograms']
    .flatMap((base) => [`${base}/filters`, `${base}/categories`, `${base}/attributions`]),
);

// Rutas personales del router de pictogramas (montado antes del authMiddleware
// global, por eso no heredan privateNoCache de /api).
export const PERSONAL_PICTOGRAM_PREFIXES = Object.freeze(
  ['/api/pictogramas', '/api/pictograms', '/pictograms']
    .flatMap((base) => [`${base}/ai`, `${base}/favorites`, `${base}/nucleo`, `${base}/tableros`]),
);
