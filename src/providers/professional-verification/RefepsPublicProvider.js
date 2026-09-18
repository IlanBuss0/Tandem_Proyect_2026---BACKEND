import axios from 'axios';
import crypto from 'node:crypto';
import * as cheerio from 'cheerio';
import { normalizeDocument, normalizeIdentityText } from '../../modules/professional-verification/name-normalization.js';

const DEFAULT_URL = 'https://www.argentina.gob.ar/salud/buscador-nacional-de-profesionales-de-la-salud';
const SELECTION_TTL_MS = 15 * 60 * 1000;
const selections = new Map();
const dniFromCuil = value => {
  const digits = String(value || '').replace(/\D/g, '');
  return /^\d{11}$/.test(digits) ? digits.slice(2, 10) : null;
};

export class RefepsProviderError extends Error {
  constructor(message, code = 'REFEPS_ERROR') { super(message); this.name = 'RefepsProviderError'; this.code = code; }
}

export default class RefepsPublicProvider {
  constructor({ http = axios, url = DEFAULT_URL, timeout = 8000, retries = 1 } = {}) {
    this.http = http; this.url = url; this.timeout = timeout; this.retries = retries;
  }

  async obtenerPerfil({ selectionId, matricula, dni, jurisdiccion, codigo, profesion } = {}) {
    const document = normalizeDocument(dni);
    if (!/^\d{4,}$/.test(String(matricula || '')) || !/^\d{7,8}$/.test(document) || !jurisdiccion) {
      throw new RefepsProviderError('Seleccioná un registro profesional válido.', 'INVALID_SELECTION');
    }
    if (selectionId) return this.getCachedSelection({ selectionId, matricula, dni: document, jurisdiccion, codigo, profesion });
    const search = await this.buscarPorMatricula(matricula);
    const candidates = search.results.filter(item => normalizeDocument(item.dni) === document
      && normalizeIdentityText(item.jurisdiccion) === normalizeIdentityText(jurisdiccion)
      && (!codigo || String(item.codigo || '') === String(codigo))
      && (!profesion || normalizeIdentityText(item.profesion) === normalizeIdentityText(profesion)));
    if (candidates.length !== 1) throw new RefepsProviderError('No pudimos identificar el registro seleccionado.', 'INVALID_SELECTION');
    return candidates[0];
  }

  buscarPorMatricula = async numeroMatricula => this.buscarPorCriterio({ searchBy: 'matricula', value: numeroMatricula });

  buscarPorDni = async dni => this.buscarPorCriterio({ searchBy: 'dni', value: dni });

  async buscarPorCriterio({ searchBy, value }) {
    console.info('[ProfessionalRegistry] Argentina.gob.ar request started');
    let lastError;
    for (let attempt = 0; attempt <= this.retries; attempt += 1) {
      try { return await this.request({ searchBy, value }); } catch (error) { lastError = error; }
    }
    console.error('[ProfessionalRegistry] Argentina.gob.ar request failed:', lastError?.code || lastError?.name);
    throw lastError instanceof RefepsProviderError ? lastError : new RefepsProviderError('No se pudo consultar el registro profesional');
  }

  async request({ searchBy, value }) {
    const getResponse = await this.http.get(this.url, { timeout: this.timeout, validateStatus: status => status === 200 });
    const $ = cheerio.load(getResponse.data);
    const formBuildId = $('#consulta-profesionales-form input[name="form_build_id"]').val() || $('input[name="form_build_id"]').val();
    if (!formBuildId) throw new RefepsProviderError('Estructura inicial inesperada', 'STRUCTURE_MISMATCH');
    const cookie = (getResponse.headers?.['set-cookie'] || []).map(value => value.split(';')[0]).join('; ');
    const body = new URLSearchParams({ searchBy, dni: searchBy === 'dni' ? String(value) : '', matricula: searchBy === 'matricula' ? String(value) : '', apellidonombre: '', op: 'Consultar', form_build_id: String(formBuildId), form_id: 'argobar_consulta_refeps_profesionales', tarro_de_miel: '' });
    const response = await this.http.post(this.url, body.toString(), { timeout: this.timeout, headers: { 'Content-Type': 'application/x-www-form-urlencoded', ...(cookie ? { Cookie: cookie } : {}) }, validateStatus: status => status === 200 });
    return this.parseHtml(response.data, { searchBy, value });
  }

  parseHtml(html, criterio) {
    const $ = cheerio.load(String(html ?? ''));
    const script = $('script').map((_index, element) => $(element).html() || '').get().find(value => value.includes('Drupal.settings.refepsProfesionales.allItems'));
    if (!script) {
      if (/no se (?:encontraron|encontró)|sin resultados/i.test($.text())) return { found: false, ambiguous: false, results: [] };
      throw new RefepsProviderError('Estructura de resultados inesperada', 'STRUCTURE_MISMATCH');
    }
    const json = this.extractAllItemsJson(script);
    if (!json) throw new RefepsProviderError('JSON de resultados ausente', 'STRUCTURE_MISMATCH');
    let items;
    try { items = JSON.parse(json); } catch { throw new RefepsProviderError('JSON de resultados inválido', 'STRUCTURE_MISMATCH'); }
    if (!Array.isArray(items)) throw new RefepsProviderError('JSON de resultados inválido', 'STRUCTURE_MISMATCH');
    const searchBy = typeof criterio === 'object' ? criterio.searchBy : 'matricula';
    const target = String(typeof criterio === 'object' ? criterio.value : criterio).trim();
    const results = items.flatMap(item => (item.profesiones || []).flatMap(profesion => (profesion.matriculas || [])
      .filter(record => searchBy === 'dni'
        ? normalizeDocument(item.nroDoc || dniFromCuil(item.cuil)) === normalizeDocument(target)
        : String(record.matricula || '').trim() === target).map(record => ({
        nombre: item.nombre || null, apellido: item.apellido || null, dni: item.nroDoc || dniFromCuil(item.cuil) || null,
        cuil: item.cuil || null, codigo: item.codigo || null, activo: item.activo || null, matricula: record.matricula,
        profesion: profesion.profesionReferencia || null, jurisdiccion: record.provinciaMatricula || null,
        habilitado: String(record.situacionMatricula || '').toLowerCase() === 'habilitado', estado: record.situacionMatricula || null,
        especialidades: profesion.refepsEspecialidad ? [profesion.refepsEspecialidad] : [], emisor: record.origenEmite || null,
        tipoSancion: record.tipoSancion || null, motivoSancion: record.motivoSancion || null, fechaFinSancion: record.fechaFinSancion || null,
        source: 'ARGENTINA_GOB_AR',
      })))).map(profile => this.cacheSelection(profile));
    return { found: results.length > 0, ambiguous: results.length > 1, results };
  }

  cacheSelection(profile) {
    const selectionId = crypto.randomUUID();
    selections.set(selectionId, { profile, expiresAt: Date.now() + SELECTION_TTL_MS });
    for (const [key, value] of selections) if (value.expiresAt <= Date.now()) selections.delete(key);
    return { ...profile, selectionId };
  }

  getCachedSelection({ selectionId, matricula, dni, jurisdiccion, codigo, profesion }) {
    const cached = selections.get(selectionId);
    if (!cached || cached.expiresAt <= Date.now()) {
      selections.delete(selectionId);
      throw new RefepsProviderError('La selección del registro venció. Buscá nuevamente al profesional.', 'SELECTION_EXPIRED');
    }
    const profile = cached.profile;
    const matches = String(profile.matricula) === String(matricula)
      && normalizeDocument(profile.dni) === normalizeDocument(dni)
      && normalizeIdentityText(profile.jurisdiccion) === normalizeIdentityText(jurisdiccion)
      && (!codigo || String(profile.codigo || '') === String(codigo))
      && (!profesion || normalizeIdentityText(profile.profesion) === normalizeIdentityText(profesion));
    if (!matches) throw new RefepsProviderError('La selección del registro no coincide.', 'INVALID_SELECTION');
    return { ...profile, selectionId };
  }

  extractAllItemsJson(script) {
    const markerIndex = script.indexOf('Drupal.settings.refepsProfesionales.allItems');
    const equalsIndex = script.indexOf('=', markerIndex); const arrayStart = script.indexOf('[', equalsIndex);
    if (markerIndex < 0 || equalsIndex < 0 || arrayStart < 0) return null;
    let depth = 0; let inString = false; let quote = null; let escaped = false;
    for (let index = arrayStart; index < script.length; index += 1) {
      const char = script[index];
      if (inString) { if (escaped) escaped = false; else if (char === '\\') escaped = true; else if (char === quote) inString = false; continue; }
      if (char === '"' || char === "'") { inString = true; quote = char; continue; }
      if (char === '[') depth += 1;
      if (char === ']') { depth -= 1; if (depth === 0) return script.slice(arrayStart, index + 1); }
    }
    return null;
  }
}
