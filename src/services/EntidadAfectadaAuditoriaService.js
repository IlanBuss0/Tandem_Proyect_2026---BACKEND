import EntidadAfectadaAuditoriaRepository from '../repositories/EntidadAfectadaAuditoriaRepository.js';

export default class EntidadAfectadaAuditoriaService {
  constructor() {
    console.log('Estoy en: EntidadAfectadaAuditoriaService.constructor()');
    this.EntidadAfectadaAuditoriaRepository = new EntidadAfectadaAuditoriaRepository();
  }

  getAllAsync = async () => {
    console.log('EntidadAfectadaAuditoriaService.getAllAsync()');
    const returnArray = await this.EntidadAfectadaAuditoriaRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`EntidadAfectadaAuditoriaService.getByIdAsync(${id})`);
    const returnEntity = await this.EntidadAfectadaAuditoriaRepository.getByIdAsync(id);
    return returnEntity;
  };

  createAsync = async (entity) => {
    console.log(`EntidadAfectadaAuditoriaService.createAsync(${JSON.stringify(entity)})`);
    const newId = await this.EntidadAfectadaAuditoriaRepository.createAsync(entity);
    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`EntidadAfectadaAuditoriaService.updateAsync(${JSON.stringify(entity)})`);
    const rowsAffected = await this.EntidadAfectadaAuditoriaRepository.updateAsync(entity);
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`EntidadAfectadaAuditoriaService.deleteByIdAsync(${id})`);
    const rowsAffected = await this.EntidadAfectadaAuditoriaRepository.deleteByIdAsync(id);
    return rowsAffected;
  };
}
