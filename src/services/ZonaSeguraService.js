import ZonaSeguraRepository from '../repositories/ZonaSeguraRepository.js';

export default class ZonaSeguraService {
  constructor() {
    console.log('Estoy en: ZonaSeguraService.constructor()');
    this.ZonaSeguraRepository = new ZonaSeguraRepository();
  }

  getAllAsync = async () => {
    console.log('ZonaSeguraService.getAllAsync()');
    const returnArray = await this.ZonaSeguraRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`ZonaSeguraService.getByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id de la zona segura es inválido.');
    }
    const returnEntity = await this.ZonaSeguraRepository.getByIdAsync(id);
    return returnEntity;
  };

  createAsync = async (entity) => {
    console.log(`ZonaSeguraService.createAsync(${JSON.stringify(entity)})`);
    this.validarZonaSeguraParaCrear(entity);
    const newId = await this.ZonaSeguraRepository.createAsync(entity);
    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`ZonaSeguraService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id de la zona segura es obligatorio para actualizar.');
    }
    const previousEntity = await this.ZonaSeguraRepository.getByIdAsync(entity.id);
    if (previousEntity == null) return 0;
    const rowsAffected = await this.ZonaSeguraRepository.updateAsync(entity);
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`ZonaSeguraService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id de la zona segura es inválido.');
    }
    const rowsAffected = await this.ZonaSeguraRepository.deleteByIdAsync(id);
    return rowsAffected;
  };

  validarZonaSeguraParaCrear = (entity) => {
    if (!entity) {
      throw new Error('La zona segura es obligatoria.');
    }
    if (!entity.id_perteneciente) {
      throw new Error('id_perteneciente es obligatorio.');
    }
    if (!entity.id_tutor_creador) {
      throw new Error('id_tutor_creador es obligatorio.');
    }
    if (!entity.nombre) {
      throw new Error('nombre es obligatorio.');
    }
    if (!entity.latitud) {
      throw new Error('latitud es obligatorio.');
    }
    if (!entity.longitud) {
      throw new Error('longitud es obligatorio.');
    }
    if (!entity.radio_metro) {
      throw new Error('radio_metro es obligatorio.');
    }
  };
}
