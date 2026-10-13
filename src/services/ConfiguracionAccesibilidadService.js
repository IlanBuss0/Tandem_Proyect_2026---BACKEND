import ConfiguracionAccesibilidadRepository from '../repositories/ConfiguracionAccesibilidadRepository.js';
import { buildCacheKey, getOrSetCache, invalidateCache } from '../cache/cacheHelper.js';
import { CACHE_TAGS, CACHE_TTL } from '../cache/cacheTags.js';

const CONFIG_ACCESIBILIDAD_TAG = 'configuraciones-accesibilidad';

export default class ConfiguracionAccesibilidadService {
  constructor() {
    console.log('Estoy en: ConfiguracionAccesibilidadService.constructor()');
    this.ConfiguracionAccesibilidadRepository = new ConfiguracionAccesibilidadRepository();
  }

  getAllAsync = async () => { console.log('ConfiguracionAccesibilidadService.getAllAsync()'); const r = await this.ConfiguracionAccesibilidadRepository.getAllAsync(); if (r == null) return null; return r; };
  // GET /api/configuraciones-accesibilidad: solo las filas de los usuarios que
  // el solicitante puede leer (readableIds lo calcula el controller con la
  // autorizacion ANTES de llegar aca). Cacheado por solicitante.
  getReadableForUserAsync = async (idSolicitante, readableIds) => {
    const key = buildCacheKey('configuraciones-accesibilidad', {
      userId: idSolicitante,
      params: { readable: [...readableIds].map(Number).sort((a, b) => a - b) },
    });
    return await getOrSetCache(key, CACHE_TTL.PERSONAL_LIST, async () => {
      const r = await this.getAllAsync();
      if (r == null) return null;
      return r.filter((row) => readableIds.has(Number(row.id_usuario)));
    }, { tags: [CONFIG_ACCESIBILIDAD_TAG, CACHE_TAGS.AUTHZ] });
  };

  invalidateCacheAsync = async () => {
    await invalidateCache({ tags: [CONFIG_ACCESIBILIDAD_TAG] });
  };

  getByIdAsync = async (id) => { console.log(`ConfiguracionAccesibilidadService.getByIdAsync(${id})`); if (!id || Number.isNaN(id)) { throw new Error('El id de la configuracion de accesibilidad es invalido.'); } return await this.ConfiguracionAccesibilidadRepository.getByIdAsync(id); };

  createAsync = async (entity) => {
    console.log(`ConfiguracionAccesibilidadService.createAsync(${JSON.stringify(entity)})`);
    this.validarConfigParaCrear(entity);
    const existente = await this.ConfiguracionAccesibilidadRepository.getByUsuarioAndClaveAsync(entity.id_usuario, entity.clave);
    if (existente != null) { throw new Error(`Ya existe la configuracion de accesibilidad '${entity.clave}' para el usuario ${entity.id_usuario}.`); }
    const newId = await this.ConfiguracionAccesibilidadRepository.createAsync(entity);
    await this.invalidateCacheAsync();
    return newId;
  };

  updateAsync = async (entity) => { console.log(`ConfiguracionAccesibilidadService.updateAsync(${JSON.stringify(entity)})`); if (!entity?.id || Number.isNaN(entity.id)) { throw new Error('El id de la configuracion de accesibilidad es obligatorio para actualizar.'); } const prev = await this.ConfiguracionAccesibilidadRepository.getByIdAsync(entity.id); if (prev == null) return 0; const rows = await this.ConfiguracionAccesibilidadRepository.updateAsync(entity); await this.invalidateCacheAsync(); return rows; };
  deleteByIdAsync = async (id) => { console.log(`ConfiguracionAccesibilidadService.deleteByIdAsync(${id})`); if (!id || Number.isNaN(id)) { throw new Error('El id de la configuracion de accesibilidad es invalido.'); } const rows = await this.ConfiguracionAccesibilidadRepository.deleteByIdAsync(id); await this.invalidateCacheAsync(); return rows; };

  validarConfigParaCrear = (entity) => {
    if (!entity) throw new Error('La configuracion de accesibilidad es obligatoria.');
    if (!entity.id_usuario) throw new Error('id_usuario es obligatorio.');
    if (!entity.clave) throw new Error('clave es obligatorio.');
    if (!entity.valor) throw new Error('valor es obligatorio.');
    if (!entity.fecha_modificacion) throw new Error('fecha_modificacion es obligatorio.');
  };
}
