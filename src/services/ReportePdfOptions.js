const SECCIONES = ['ia', 'asistencia', 'detalle'];
const MAX_RANGO_DIAS = 366;
const MAX_PACIENTES = 200;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Secciones que salen cuando el cliente no manda `incluir` (igual que antes de existir el parametro). */
export const DEFAULT_INCLUIR_MENSUAL = ['ia', 'asistencia'];
export const DEFAULT_INCLUIR_HISTORIAL = ['asistencia', 'detalle'];

function badRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

const asString = (value) => (Array.isArray(value) ? value[0] : value);

/** 'YYYY-MM-DD' valida (dia real del calendario) -> Date en UTC, o null. */
function parseIsoDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value ?? ''));
  if (!match) return null;
  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day ? date : null;
}

/** Rango [desde, hasta] inclusive. Devuelve null si no se pidio ninguno. */
export function parseRango(query = {}) {
  const desdeRaw = asString(query.desde);
  const hastaRaw = asString(query.hasta);
  if (desdeRaw === undefined && hastaRaw === undefined) return null;
  if (!desdeRaw || !hastaRaw) throw badRequest('desde y hasta se piden juntos.');
  const desde = parseIsoDate(desdeRaw);
  const hasta = parseIsoDate(hastaRaw);
  if (!desde || !hasta) throw badRequest('desde y hasta deben ser fechas validas con formato YYYY-MM-DD.');
  if (desde > hasta) throw badRequest('desde no puede ser posterior a hasta.');
  if ((hasta - desde) / DAY_MS + 1 > MAX_RANGO_DIAS) throw badRequest(`El rango no puede superar ${MAX_RANGO_DIAS} dias.`);
  return { desde: desdeRaw, hasta: hastaRaw, inicio: desde, finExclusivo: new Date(hasta.getTime() + DAY_MS) };
}

/** Lista de secciones a incluir; sin parametro, las de `defaults`. */
export function parseIncluir(query = {}, defaults = DEFAULT_INCLUIR_MENSUAL) {
  const raw = asString(query.incluir);
  if (raw === undefined) return new Set(defaults);
  const items = String(raw).split(',').map((item) => item.trim().toLowerCase()).filter(Boolean);
  if (items.length === 0) throw badRequest('incluir necesita al menos una seccion (ia, asistencia, detalle).');
  const invalid = items.find((item) => !SECCIONES.includes(item));
  if (invalid) throw badRequest(`Seccion invalida en incluir: ${invalid}. Usa ia, asistencia o detalle.`);
  return new Set(items);
}

/** Ids de pacientes elegidos; null si no se pidio el filtro. */
export function parsePacientes(query = {}) {
  const raw = asString(query.pacientes);
  if (raw === undefined) return null;
  const items = String(raw).split(',').map((item) => item.trim()).filter(Boolean);
  if (items.length === 0) throw badRequest('pacientes necesita al menos un id.');
  if (items.length > MAX_PACIENTES) throw badRequest(`Podes elegir hasta ${MAX_PACIENTES} pacientes.`);
  const ids = items.map(Number);
  if (ids.some((id) => !Number.isInteger(id) || id <= 0)) throw badRequest('pacientes debe ser una lista de ids numericos.');
  return [...new Set(ids)];
}

export const formatFechaAr = (isoDate) => isoDate.split('-').reverse().join('/');
