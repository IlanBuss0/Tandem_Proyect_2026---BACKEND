// Unica responsabilidad: armar el informe "Donde se traba" (pasos donde mas
// pidio ayuda una persona). Puro — recibe eventos ya leidos de eventos_uso y,
// solo para eventos viejos sin titulo/pasoTexto guardados, el contexto de las
// actividades asignadas; no hace queries. Solo cuenta lo que paso: no
// interpreta ni saca conclusiones.
export const HELP_MOTIVOS = ['ayuda', 'no_entiende', 'pausa'];

const DEFAULT_DAYS = 30;
const MAX_DAYS = 90;
const MAX_SPOTS = 10;
const MAX_STEP_TEXT = 200;

// Sin valor -> 30; entero entre 1 y 90 -> ese valor; cualquier otra cosa
// -> null, que el controller traduce a 400 (misma politica que evolucion.js:
// el cliente no controla el tamano de la consulta sin tope).
export function parseHelpDaysParam(value) {
  if (value === undefined || value === null || value === '') return DEFAULT_DAYS;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= MAX_DAYS ? parsed : null;
}

// Mismo formato que arma el creador de actividades: una linea "Pasos: a | b | c".
export function extractSteps(descripcion) {
  const line = String(descripcion || '').split('\n').find((item) => item.trim().startsWith('Pasos:'));
  if (!line) return [];
  return line.trim().replace(/^Pasos:\s*/i, '').split('|').map((step) => step.trim()).filter(Boolean);
}

const normalizeTitle = (title) => String(title).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

const toIso = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

/**
 * @param {Array} events filas de eventos_uso de tipo 'ayuda_pedida' (valor.contexto: actividad | rutina | comunicador)
 * @param {Map<number, {titulo: string|null, descripcion: string|null}>} contextByAsignadaId
 */
export function buildHelpSpotsReport(events, contextByAsignadaId = new Map(), { dias = DEFAULT_DAYS } = {}) {
  const porMotivo = { ayuda: 0, no_entiende: 0, pausa: 0 };
  const groups = new Map();
  let comunicacion = 0;
  let total = 0;

  const add = (key, base, when) => {
    // Los eventos vienen del mas nuevo al mas viejo: titulo y texto del grupo
    // son los del ultimo pedido.
    const group = groups.get(key) || { ...base, cantidad: 0, ultimaVez: null };
    group.cantidad += 1;
    const iso = toIso(when);
    if (iso && (!group.ultimaVez || iso > group.ultimaVez)) group.ultimaVez = iso;
    groups.set(key, group);
    total += 1;
  };

  for (const event of events || []) {
    if (event.tipo_evento !== 'ayuda_pedida') continue;
    const saved = event.valor || {};
    const motivo = saved.motivo;
    if (!HELP_MOTIVOS.includes(motivo)) continue;
    porMotivo[motivo] += 1;

    const paso = Number(saved.paso);
    const step = Number.isInteger(paso) && paso >= 1 ? paso : null;

    if (saved.contexto === 'comunicador') {
      // "No puedo hablar": solo cuenta cuando la persona avisó de verdad
      // ("Necesito ayuda" / "Necesito espacio"), una sola fila sin paso.
      comunicacion += 1;
      add('comunicacion', { contexto: 'comunicacion', titulo: 'No puedo hablar', paso: null, pasoTexto: null }, event.ocurrido_en);
    } else if (saved.contexto === 'rutina') {
      // Una rutina no tiene un id propio estable: se agrupa por titulo (sin
      // mayusculas, tildes ni espacios de mas) y paso, nunca por entidad_id.
      const titulo = String(saved.titulo || '').trim() || 'Rutina';
      add(`r:${normalizeTitle(titulo)}:${step}`, {
        contexto: 'rutina',
        titulo,
        paso: step,
        pasoTexto: saved.pasoTexto ? String(saved.pasoTexto).slice(0, MAX_STEP_TEXT) : null,
      }, event.ocurrido_en);
    } else {
      // Sin contexto (eventos viejos) o 'actividad': actividad asignada.
      // Evento nuevo: titulo y pasoTexto guardados al pedir ayuda. Evento viejo:
      // se leen de la actividad (si todavia existe y es de esta persona).
      const asignadaId = Number(event.entidad_id);
      const context = saved.titulo ? null : contextByAsignadaId.get(asignadaId);
      const titulo = String(saved.titulo || context?.titulo || '').trim() || 'Actividad';
      const rawStepText = saved.pasoTexto || (step && context ? extractSteps(context.descripcion)[step - 1] : null);
      add(`a:${asignadaId}:${step}`, {
        contexto: 'actividad',
        titulo,
        paso: step,
        pasoTexto: rawStepText ? String(rawStepText).slice(0, MAX_STEP_TEXT) : null,
      }, event.ocurrido_en);
    }
  }

  const lugares = [...groups.values()]
    .sort((a, b) => b.cantidad - a.cantidad || String(b.ultimaVez).localeCompare(String(a.ultimaVez)))
    .slice(0, MAX_SPOTS);

  // total = suma de porMotivo. comunicacion es cuantos de esos pedidos vinieron
  // del comunicador ("No puedo hablar"); ya estan contados en porMotivo.
  return { dias, total, porMotivo, comunicacion, lugares };
}
