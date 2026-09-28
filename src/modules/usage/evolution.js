import { sentimentScore } from './emotion-sentiment.js';

// Unica responsabilidad: agrupar eventos de uso por semana ISO para mostrar
// "evolucion en el tiempo" (Sesion 21, item 44) — cuantos pasos de rutina
// se completaron y que tan positivo fue el animo, semana a semana. Puro —
// recibe eventos ya leidos de eventos_uso (Sesion 9), no hace queries.
//
// A diferencia de pattern-detection.js, ACA no hay piso minimo: mostrar
// "esta semana completaste 3 pasos" no es una conclusion causal, es un
// dato descriptivo. El piso minimo aplica cuando se afirma una relacion
// (X causa/se asocia con Y), no cuando se cuenta lo que paso.
function isoWeekKey(dateInput) {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return null;

  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

const ALLOWED_WEEKS_PARAMS = new Set([8, 13, 52]);
const ALLOWED_DAYS_PARAMS = new Set([2, 14]);

// Whitelist del selector de periodo del frontend ("Este mes" = 8 semanas,
// "Ultimos 3 meses" = 13, "Ultimo anio" = 52). Puro: sin valor -> default 8; cualquier
// otra cosa (texto, 0, negativo, 9, etc.) -> null, que el controller
// traduce a 400. No se acepta un numero arbitrario de semanas para no
// abrir una consulta sin tope real controlada por el cliente.
export function parseWeeksParam(value) {
  if (value === undefined || value === null || value === '') return 8;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || !ALLOWED_WEEKS_PARAMS.has(parsed)) return null;
  return parsed;
}

// Whitelist del selector "Hoy" (2 dias) / "Ultima semana" (14 dias). Mismo
// contrato que parseWeeksParam, pero sin default: sin valor tambien -> null.
export function parseDaysParam(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && ALLOWED_DAYS_PARAMS.has(parsed) ? parsed : null;
}

const newBucket = () => ({ routineCompletions: 0, emotions: [] });

function tally(bucket, event) {
  if (event.tipo_evento === 'rutina_paso_completado') bucket.routineCompletions += 1;
  if (event.tipo_evento === 'emocion_registrada' && event.valor?.emotion) {
    bucket.emotions.push({ emotion: event.valor.emotion });
  }
}

function summarize(bucket) {
  const sentiment = sentimentScore(bucket.emotions);
  return {
    routineCompletions: bucket.routineCompletions,
    positiveEmotionRatio: sentiment ? sentiment.positiveRatio : null,
    emotionSampleSize: sentiment ? sentiment.sampleSize : 0,
  };
}

/**
 * @param {{tipo_evento: string, ocurrido_en: string, valor?: {emotion?: string}}[]} events
 * @param {{maxWeeks?: number}} [options]
 */
export function buildEvolutionReport(events, options = {}) {
  const maxWeeks = options.maxWeeks ?? 8;
  const byWeek = new Map();

  for (const event of events || []) {
    const week = isoWeekKey(event?.ocurrido_en);
    if (!week) continue;
    if (!byWeek.has(week)) byWeek.set(week, newBucket());
    tally(byWeek.get(week), event);
  }

  const weeks = Array.from(byWeek.keys()).sort().slice(-maxWeeks);
  return weeks.map((week) => ({ week, ...summarize(byWeek.get(week)) }));
}

/**
 * Igual que buildEvolutionReport pero por dia (UTC) y continuo: devuelve
 * siempre `days` filas terminando hoy, con ceros donde no hubo eventos, para
 * que el frontend pueda comparar "hoy vs ayer" o "7 dias vs 7 anteriores"
 * partiendo la lista a la mitad.
 * @param {{tipo_evento: string, ocurrido_en: string, valor?: {emotion?: string}}[]} events
 * @param {number} days
 * @param {Date} [now]
 */
export function buildDailyEvolutionReport(events, days, now = new Date()) {
  const byDay = new Map();
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const day = new Date(now);
    day.setUTCDate(day.getUTCDate() - offset);
    byDay.set(day.toISOString().slice(0, 10), newBucket());
  }

  for (const event of events || []) {
    const date = new Date(event?.ocurrido_en);
    if (Number.isNaN(date.getTime())) continue;
    const bucket = byDay.get(date.toISOString().slice(0, 10));
    if (bucket) tally(bucket, event);
  }

  return Array.from(byDay, ([day, bucket]) => ({ day, ...summarize(bucket) }));
}
