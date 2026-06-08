import axiosClient from '../modules/axios/axiosClient.js';
import https from 'https';
import PictogramaRepository from '../repositories/PictogramaRepository.js';

const DEFAULT_ARASAAC_API_URL = 'https://api.arasaac.org/api';
const DEFAULT_ARASAAC_STATIC_URL = 'https://static.arasaac.org/pictograms';
const DEFAULT_LANGUAGE = 'es';
const DEFAULT_RESOLUTION = 300;
const DEFAULT_LIMIT = 48;
const MAX_LIMIT = 100;
const DEFAULT_ARASAAC_TIMEOUT_MS = 30000;
const SYNC_SEARCH_TERMS = [
  'acciones y rutinas',
  'actividades',
  'casa',
  'comida',
  'comunicacion',
  'compras y dinero',
  'conceptos',
  'conductas',
  'emociones',
  'escuela y aprendizaje',
  'higiene',
  'lugares',
  'naturaleza',
  'objetos',
  'ocio',
  'personas',
  'salud y cuerpo',
  'tecnologia',
  'tiempo',
  'transporte',
  'vida diaria',
  'beber',
  'comer',
  'dolor',
  'familia',
  'jugar',
  'leer',
  'vestirse',
];
const allowSelfSignedCertificates =
  process.env.ARASAAC_ALLOW_SELF_SIGNED === 'true' || process.env.NODE_ENV !== 'production';
const arasaacHttpsAgent = new https.Agent({
  rejectUnauthorized: !allowSelfSignedCertificates,
});

const categoryByArasaacCategory = {
  adjective: 'conceptos',
  adjetive: 'conceptos',
  adverb: 'conceptos',
  alphabet: 'comunicacion',
  animal: 'naturaleza',
  animals: 'naturaleza',
  art: 'ocio',
  bathroom: 'higiene',
  behavior: 'conductas',
  body: 'salud y cuerpo',
  bodypart: 'salud y cuerpo',
  bodyparts: 'salud y cuerpo',
  building: 'lugares',
  calendar: 'tiempo',
  city: 'lugares',
  clothes: 'vida diaria',
  clothing: 'vida diaria',
  color: 'conceptos',
  colours: 'conceptos',
  computer: 'tecnologia',
  computers: 'tecnologia',
  concept: 'conceptos',
  concepts: 'conceptos',
  daily: 'vida diaria',
  daily_living: 'vida diaria',
  day: 'tiempo',
  description: 'conceptos',
  device: 'tecnologia',
  devices: 'tecnologia',
  drink: 'comida',
  drinks: 'comida',
  emotion: 'emociones',
  emotions: 'emociones',
  event: 'acciones y rutinas',
  events: 'acciones y rutinas',
  family: 'personas',
  feeling: 'emociones',
  feelings: 'emociones',
  food: 'comida',
  foods: 'comida',
  furniture: 'casa',
  game: 'ocio',
  games: 'ocio',
  geography: 'lugares',
  group: 'personas',
  groups: 'personas',
  health: 'salud y cuerpo',
  hygiene: 'higiene',
  job: 'personas',
  jobs: 'personas',
  kitchen: 'comida',
  leisure: 'ocio',
  location: 'lugares',
  locations: 'lugares',
  meal: 'comida',
  meals: 'comida',
  medical: 'salud y cuerpo',
  medicine: 'salud y cuerpo',
  money: 'compras y dinero',
  music: 'ocio',
  nature: 'naturaleza',
  noun: 'objetos',
  nouns: 'objetos',
  number: 'conceptos',
  numbers: 'conceptos',
  object: 'objetos',
  objects: 'objetos',
  occupation: 'personas',
  occupations: 'personas',
  people: 'personas',
  person: 'personas',
  personal: 'vida diaria',
  place: 'lugares',
  places: 'lugares',
  plant: 'naturaleza',
  plants: 'naturaleza',
  pronoun: 'comunicacion',
  pronouns: 'comunicacion',
  quantity: 'conceptos',
  school: 'escuela y aprendizaje',
  education: 'escuela y aprendizaje',
  science: 'escuela y aprendizaje',
  shape: 'conceptos',
  shapes: 'conceptos',
  sign: 'comunicacion',
  signs: 'comunicacion',
  social: 'personas',
  sport: 'ocio',
  sports: 'ocio',
  technology: 'tecnologia',
  time: 'tiempo',
  toy: 'ocio',
  toys: 'ocio',
  transport: 'transporte',
  transportation: 'transporte',
  vehicle: 'transporte',
  vehicles: 'transporte',
  verb: 'acciones y rutinas',
  verbs: 'acciones y rutinas',
  weather: 'naturaleza',
  house: 'casa',
  home: 'casa',
  communication: 'comunicacion',
  action: 'actividades',
  actions: 'actividades',
};

const categoryRules = [
  { includes: ['education', 'educational', 'school', 'academic'], category: 'escuela y aprendizaje' },
  { includes: ['health', 'sanitary', 'medical', 'medicine', 'covid', 'physiotherapy', 'locomotor'], category: 'salud y cuerpo' },
  { includes: ['residential', 'domestic', 'house', 'home'], category: 'casa' },
  { includes: ['commercial', 'shopping', 'shop', 'store', 'money'], category: 'compras y dinero' },
  { includes: ['building', 'place', 'location', 'centre', 'center'], category: 'lugares' },
  { includes: ['transport', 'movement', 'vehicle'], category: 'transporte' },
  { includes: ['hardware', 'computer', 'electrical appliance', 'technology', 'device'], category: 'tecnologia' },
  { includes: ['toy', 'game', 'sport', 'basketball', 'athlete', 'beach', 'leisure', 'art', 'music', 'drawing'], category: 'ocio' },
  { includes: ['animal', 'plant', 'nature', 'weather'], category: 'naturaleza' },
  { includes: ['person', 'people', 'family', 'personnel', 'professional'], category: 'personas' },
  { includes: ['food', 'meal', 'drink', 'kitchen'], category: 'comida' },
  { includes: ['communication', 'expression', 'signaling', 'document', 'vocabulary'], category: 'comunicacion' },
  { includes: ['verb', 'event', 'routine', 'action'], category: 'acciones y rutinas' },
  { includes: ['object', 'material', 'equipment', 'appliance'], category: 'objetos' },
  { includes: ['color', 'number', 'shape', 'quantity', 'concept'], category: 'conceptos' },
];

function normalizeLimit(value) {
  const limit = Number.parseInt(value, 10);
  if (Number.isNaN(limit) || limit <= 0) return DEFAULT_LIMIT;
  return Math.min(limit, MAX_LIMIT);
}

function normalizeLanguage(value) {
  return String(value || DEFAULT_LANGUAGE).trim().toLowerCase() || DEFAULT_LANGUAGE;
}

function buildImageUrl(id, resolution = DEFAULT_RESOLUTION) {
  const staticUrl = (process.env.ARASAAC_STATIC_URL || DEFAULT_ARASAAC_STATIC_URL).replace(/\/$/, '');
  return `${staticUrl}/${id}/${id}_${resolution}.png`;
}

function normalizeKeyword(keyword) {
  if (!keyword || typeof keyword !== 'object') return null;
  return keyword.keyword || keyword.plural || null;
}

function normalizeCategory(rawCategories = []) {
  const categories = Array.isArray(rawCategories) ? rawCategories : [];
  const translated = categories
    .map((category) => categoryByArasaacCategory[String(category).toLowerCase()])
    .find(Boolean);

  if (translated) return translated;

  const normalizedCategories = categories.map((category) => String(category).toLowerCase().replace(/[_-]/g, ' '));
  const matchedRule = categoryRules.find((rule) =>
    normalizedCategories.some((category) => rule.includes.some((text) => category.includes(text))),
  );

  return matchedRule?.category || 'otros';
}

function normalizePictogram(pictogram, language) {
  const id = pictogram?._id || pictogram?.id;
  const keywords = Array.isArray(pictogram?.keywords) ? pictogram.keywords.map(normalizeKeyword).filter(Boolean) : [];
  const name = keywords[0] || pictogram?.text || pictogram?.name || `Pictograma ${id}`;

  return {
    id: String(id),
    arasaacId: Number(id),
    name,
    emoji: '',
    imageUrl: buildImageUrl(id),
    downloadUrl: buildImageUrl(id, 500),
    category: normalizeCategory(pictogram?.categories),
    tags: Array.from(new Set(keywords.slice(1, 8))),
    language,
    source: 'ARASAAC',
    author: 'Sergio Palao',
    license: 'CC BY-NC-SA',
  };
}

export default class PictogramaService {
  constructor() {
    this.baseUrl = (process.env.ARASAAC_API_BASE_URL || DEFAULT_ARASAAC_API_URL).replace(/\/$/, '');
    this.PictogramaRepository = new PictogramaRepository();
    this.schemaReady = null;
  }

  async ensureSchemaAsync() {
    if (!this.schemaReady) {
      this.schemaReady = this.PictogramaRepository.ensureSchemaAsync();
    }

    return await this.schemaReady;
  }

  async searchAsync({ search, category, language, limit }) {
    await this.ensureSchemaAsync();

    const locale = normalizeLanguage(language);
    const normalizedLimit = normalizeLimit(limit);
    const searchText = String(search || category || '').trim();

    const cached = await this.PictogramaRepository.searchAsync({
      search,
      category,
      language: locale,
      limit: normalizedLimit,
    });

    if (cached.length > 0) return cached;

    const path = searchText
      ? `/pictograms/${encodeURIComponent(locale)}/search/${encodeURIComponent(searchText)}`
      : `/pictograms/${encodeURIComponent(locale)}/new/${normalizedLimit}`;

    const pictograms = await this.fetchArasaacPictograms(path);
    const normalized = pictograms
      .slice(0, normalizedLimit)
      .map((pictogram) => normalizePictogram(pictogram, locale));

    await this.PictogramaRepository.upsertManyAsync(normalized);

    if (!category || category === 'todas' || searchText === category) return normalized;

    const categoryText = String(category).toLowerCase();
    return normalized.filter((pictogram) => pictogram.category === categoryText);
  }

  async getByIdAsync(id, language) {
    if (!id) {
      throw new Error('El id del pictograma es obligatorio.');
    }

    await this.ensureSchemaAsync();

    const locale = normalizeLanguage(language);
    const cached = await this.PictogramaRepository.getByExternalIdAsync(id, locale);
    if (cached) return cached;

    const path = `/pictograms/${encodeURIComponent(locale)}/${encodeURIComponent(id)}`;
    const pictogram = await this.fetchArasaacPictogram(path);
    const normalized = pictogram ? normalizePictogram(pictogram, locale) : null;
    if (normalized) await this.PictogramaRepository.upsertManyAsync([normalized]);
    return normalized;
  }

  async getCategoriesAsync(language) {
    await this.ensureSchemaAsync();
    return await this.PictogramaRepository.getCategoriesAsync(normalizeLanguage(language));
  }

  async downloadAsync(id, language) {
    const locale = normalizeLanguage(language);
    const pictogram = await this.getByIdAsync(id, locale);
    if (!pictogram?.downloadUrl && !pictogram?.imageUrl) return null;

    const url = pictogram.downloadUrl || pictogram.imageUrl;
    const response = await axiosClient.get(url, {
      responseType: 'arraybuffer',
      httpsAgent: arasaacHttpsAgent,
      timeout: Number.parseInt(process.env.ARASAAC_REQUEST_TIMEOUT_MS || DEFAULT_ARASAAC_TIMEOUT_MS, 10),
    });

    await this.PictogramaRepository.incrementDownloadAsync(id, locale);

    return {
      data: Buffer.from(response.data),
      contentType: response.headers?.['content-type'] || 'image/png',
      fileName: `${String(pictogram.name || `pictograma-${id}`).replace(/[^\w.-]+/g, '_')}.png`,
    };
  }

  async getFavoritesAsync(userId, language) {
    await this.ensureSchemaAsync();
    if (!userId) {
      throw new Error('El usuario es obligatorio.');
    }

    return await this.PictogramaRepository.getFavoritesByUserAsync(userId, normalizeLanguage(language));
  }

  async markSavedAsync(id, language, userId) {
    await this.ensureSchemaAsync();
    if (!userId) {
      throw new Error('El usuario es obligatorio.');
    }

    const locale = normalizeLanguage(language);
    const pictogram = await this.getByIdAsync(id, locale);
    if (!pictogram) return null;

    await this.PictogramaRepository.addFavoriteAsync({ userId, pictogramId: id, language: locale });
    return pictogram;
  }

  async unmarkSavedAsync(id, language, userId) {
    await this.ensureSchemaAsync();
    if (!userId) {
      throw new Error('El usuario es obligatorio.');
    }

    const locale = normalizeLanguage(language);
    return await this.PictogramaRepository.removeFavoriteAsync({ userId, pictogramId: id, language: locale });
  }

  getImageUrl(id, resolution) {
    if (!id) {
      throw new Error('El id del pictograma es obligatorio.');
    }

    const normalizedResolution = Number.parseInt(resolution, 10) || DEFAULT_RESOLUTION;
    return buildImageUrl(id, normalizedResolution);
  }

  async fetchArasaacPictograms(path) {
    try {
      const response = await axiosClient.get(`${this.baseUrl}${path}`, {
        headers: { Accept: 'application/json' },
        httpsAgent: arasaacHttpsAgent,
        timeout: Number.parseInt(process.env.ARASAAC_REQUEST_TIMEOUT_MS || DEFAULT_ARASAAC_TIMEOUT_MS, 10),
      });
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      if (error?.response?.status === 404) return [];
      throw new Error(`No se pudieron obtener pictogramas de ARASAAC: ${error.message}`);
    }
  }

  async syncFromArasaacAsync({ language } = {}) {
    await this.ensureSchemaAsync();

    const locale = normalizeLanguage(language);
    const pictograms = await this.fetchArasaacCatalog(locale);
    const normalized = pictograms.map((pictogram) => normalizePictogram(pictogram, locale));
    const affected = await this.PictogramaRepository.upsertManyAsync(normalized);

    return {
      language: locale,
      fetched: pictograms.length,
      saved: affected,
    };
  }

  async fetchArasaacCatalog(locale) {
    const configuredPath = process.env.ARASAAC_PICTOGRAMS_SYNC_PATH;
    const candidatePaths = [
      configuredPath ? configuredPath.replace('{language}', encodeURIComponent(locale)) : null,
      `/pictograms/${encodeURIComponent(locale)}/all`,
      `/pictograms/${encodeURIComponent(locale)}`,
    ].filter(Boolean);

    for (const path of candidatePaths) {
      const pictograms = await this.fetchArasaacPictograms(path).catch(() => []);
      if (pictograms.length > 0) return pictograms;
    }

    const byId = new Map();
    for (const term of SYNC_SEARCH_TERMS) {
      const path = `/pictograms/${encodeURIComponent(locale)}/search/${encodeURIComponent(term)}`;
      const pictograms = await this.fetchArasaacPictograms(path).catch(() => []);
      for (const pictogram of pictograms) {
        const id = pictogram?._id || pictogram?.id;
        if (id) byId.set(String(id), pictogram);
      }
    }

    return Array.from(byId.values());
  }

  async fetchArasaacPictogram(path) {
    try {
      const response = await axiosClient.get(`${this.baseUrl}${path}`, {
        headers: { Accept: 'application/json' },
        httpsAgent: arasaacHttpsAgent,
        timeout: Number.parseInt(process.env.ARASAAC_REQUEST_TIMEOUT_MS || DEFAULT_ARASAAC_TIMEOUT_MS, 10),
      });
      return response.data;
    } catch (error) {
      if (error?.response?.status === 404) return null;
      throw new Error(`No se pudo obtener el pictograma de ARASAAC: ${error.message}`);
    }
  }
}
