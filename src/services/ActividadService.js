import ActividadRepository from '../repositories/ActividadRepository.js';
import { cacheService } from './CacheService.js';

export default class ActividadService {
  constructor() {
    console.log('Estoy en: ActividadService.constructor()');
    this.ActividadRepository = new ActividadRepository();
  }

  getAllAsync = async () => {
    console.log('ActividadService.getAllAsync()');
    const cacheKey = 'actividad.catalog';
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;
    const returnArray = await this.ActividadRepository.getAllAsync();
    if (returnArray == null) return null;
    await cacheService.set(cacheKey, returnArray, 1800);
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`ActividadService.getByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id de la actividad es invalido.');
    }
    const cacheKey = `actividad.${id}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;
    const returnEntity = await this.ActividadRepository.getByIdAsync(id);
    if (returnEntity) await cacheService.set(cacheKey, returnEntity, 1800);
    return returnEntity;
  };

  createAsync = async (entity) => {
    console.log(`ActividadService.createAsync(${JSON.stringify(entity)})`);
    this.validarActividadParaCrear(entity);
    const newId = await this.ActividadRepository.createAsync(entity);
    await cacheService.delByPattern('actividad.*');
    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`ActividadService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id de la actividad es obligatorio para actualizar.');
    }
    const previousEntity = await this.ActividadRepository.getByIdAsync(entity.id);
    if (previousEntity == null) return 0;
    const rowsAffected = await this.ActividadRepository.updateAsync(entity);
    await cacheService.delByPattern('actividad.*');
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`ActividadService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id de la actividad es invalido.');
    }
    const rowsAffected = await this.ActividadRepository.deleteByIdAsync(id);
    await cacheService.delByPattern('actividad.*');
    return rowsAffected;
  };

  validarActividadParaCrear = (entity) => {
    if (!entity) {
      throw new Error('La actividad es obligatoria.');
    }
    if (!entity.id_tipo_actividad) {
      throw new Error('id_tipo_actividad es obligatorio.');
    }
    if (!entity.id_punto_otorgado) {
      throw new Error('id_punto_otorgado es obligatorio.');
    }
    if (!entity.titulo) {
      throw new Error('titulo es obligatorio.');
    }
  };
}
