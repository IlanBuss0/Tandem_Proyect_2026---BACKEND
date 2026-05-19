import TipoActividadRepository from '../repositories/TipoActividadRepository.js';

export default class TipoActividadService {
  constructor() {
    console.log('Estoy en: TipoActividadService.constructor()');
    this.TipoActividadRepository = new TipoActividadRepository();
  }

  getAllAsync = async () => {
    console.log('TipoActividadService.getAllAsync()');
    const returnArray = await this.TipoActividadRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`TipoActividadService.getByIdAsync(${id})`);
    const returnEntity = await this.TipoActividadRepository.getByIdAsync(id);
    return returnEntity;
  };

  createAsync = async (entity) => {
    console.log(`TipoActividadService.createAsync(${JSON.stringify(entity)})`);
    const newId = await this.TipoActividadRepository.createAsync(entity);
    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`TipoActividadService.updateAsync(${JSON.stringify(entity)})`);
    const rowsAffected = await this.TipoActividadRepository.updateAsync(entity);
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`TipoActividadService.deleteByIdAsync(${id})`);
    const rowsAffected = await this.TipoActividadRepository.deleteByIdAsync(id);
    return rowsAffected;
  };
}
