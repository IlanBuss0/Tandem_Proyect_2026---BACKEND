import PerfilProfesionalRepository from '../repositories/PerfilProfesionalRepository.js';
import { buildCacheKey, getOrSetCache, invalidateCache } from '../cache/cacheHelper.js';
import { CACHE_TAGS, CACHE_TTL } from '../cache/cacheTags.js';

// El directorio es igual para todos los que pueden verlo (tutores y
// pertenecientes; el controller lo chequea antes): clave global.
const DIRECTORY_CACHE_KEY = buildCacheKey('profesionales-directory');

export async function invalidateProfessionalDirectoryCache() {
  await invalidateCache({ tags: [CACHE_TAGS.PROFESSIONAL_DIRECTORY] });
}

export default class PerfilProfesionalService {
  constructor() {
    this.repository = new PerfilProfesionalRepository();
  }

  getMineAsync = (idProfessional) => this.repository.getByProfessionalIdAsync(idProfessional);
  getDirectoryAsync = () => getOrSetCache(
    DIRECTORY_CACHE_KEY,
    CACHE_TTL.PROFESSIONAL_DIRECTORY,
    () => this.repository.getDirectoryAsync(),
    { tags: [CACHE_TAGS.PROFESSIONAL_DIRECTORY] },
  );

  saveMineAsync = async (idProfessional, data = {}) => {
    const email = String(data.correo_contacto || '').trim().toLowerCase();
    const whatsapp = String(data.whatsapp_contacto || '').replace(/[^\d+]/g, '');
    if (data.publicar_correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      const error = new Error('Ingresa un correo de contacto valido.');
      error.statusCode = 400;
      throw error;
    }
    if (data.publicar_whatsapp && !/^\+?[1-9]\d{7,14}$/.test(whatsapp)) {
      const error = new Error('Ingresa un WhatsApp en formato internacional.');
      error.statusCode = 400;
      throw error;
    }
    const saved = await this.repository.upsertForProfessionalAsync(idProfessional, {
      descripcion: String(data.descripcion || '').trim().slice(0, 2000) || null,
      experiencia: String(data.experiencia || '').trim().slice(0, 1000) || null,
      precio_sesion: data.precio_sesion === '' || data.precio_sesion == null ? null : Number(data.precio_sesion),
      informacion_precio: String(data.informacion_precio || '').trim().slice(0, 500) || null,
      visible_en_tienda: Boolean(data.visible_en_tienda),
      modalidad: String(data.modalidad || '').trim().slice(0, 80) || null,
      disponibilidad: String(data.disponibilidad || '').trim().slice(0, 255) || null,
      correo_contacto: email || null,
      whatsapp_contacto: whatsapp || null,
      publicar_correo: Boolean(data.publicar_correo),
      publicar_whatsapp: Boolean(data.publicar_whatsapp),
    });
    await invalidateProfessionalDirectoryCache();
    return saved;
  };
}
