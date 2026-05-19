import DificultadActividadRepository from '../repositories/DificultadActividadRepository.js';

export default class DificultadActividadService {
  constructor() {
    console.log('Estoy en: DificultadActividadService.constructor()');
    this.DificultadActividadRepository = new DificultadActividadRepository();
  }

  getAllAsync = async () => {
    console.log('DificultadActividadService.getAllAsync()');
    const returnArray = await this.DificultadActividadRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`DificultadActividadService.getByIdAsync(${id})`);
    const returnEntity = await this.DificultadActividadRepository.getByIdAsync(id);
    return returnEntity;
  };

  createAsync = async (entity) => {
    console.log(`DificultadActividadService.createAsync(${JSON.stringify(entity)})`);
    const newId = await this.DificultadActividadRepository.createAsync(entity);
    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`DificultadActividadService.updateAsync(${JSON.stringify(entity)})`);
    const rowsAffected = await this.DificultadActividadRepository.updateAsync(entity);
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`DificultadActividadService.deleteByIdAsync(${id})`);
    const rowsAffected = await this.DificultadActividadRepository.deleteByIdAsync(id);
    return rowsAffected;
  };
}
