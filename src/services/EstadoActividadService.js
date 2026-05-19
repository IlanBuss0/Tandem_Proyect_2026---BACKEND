import EstadoActividadRepository from '../repositories/EstadoActividadRepository.js';

export default class EstadoActividadService {
  constructor() {
    console.log('Estoy en: EstadoActividadService.constructor()');
    this.EstadoActividadRepository = new EstadoActividadRepository();
  }

  getAllAsync = async () => {
    console.log('EstadoActividadService.getAllAsync()');
    const returnArray = await this.EstadoActividadRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`EstadoActividadService.getByIdAsync(${id})`);
    const returnEntity = await this.EstadoActividadRepository.getByIdAsync(id);
    return returnEntity;
  };

  createAsync = async (entity) => {
    console.log(`EstadoActividadService.createAsync(${JSON.stringify(entity)})`);
    const newId = await this.EstadoActividadRepository.createAsync(entity);
    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`EstadoActividadService.updateAsync(${JSON.stringify(entity)})`);
    const rowsAffected = await this.EstadoActividadRepository.updateAsync(entity);
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`EstadoActividadService.deleteByIdAsync(${id})`);
    const rowsAffected = await this.EstadoActividadRepository.deleteByIdAsync(id);
    return rowsAffected;
  };
}
