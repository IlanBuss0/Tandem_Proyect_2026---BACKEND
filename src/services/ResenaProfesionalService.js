import ResenaProfesionalRepository from '../repositories/ResenaProfesionalRepository.js';

export default class ResenaProfesionalService {
  constructor() {
    console.log('Estoy en: ResenaProfesionalService.constructor()');
    this.ResenaProfesionalRepository = new ResenaProfesionalRepository();
  }

  getAllAsync = async () => {
    console.log('ResenaProfesionalService.getAllAsync()');
    const returnArray = await this.ResenaProfesionalRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`ResenaProfesionalService.getByIdAsync(${id})`);
    const returnEntity = await this.ResenaProfesionalRepository.getByIdAsync(id);
    return returnEntity;
  };

  createAsync = async (entity) => {
    console.log(`ResenaProfesionalService.createAsync(${JSON.stringify(entity)})`);
    const newId = await this.ResenaProfesionalRepository.createAsync(entity);
    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`ResenaProfesionalService.updateAsync(${JSON.stringify(entity)})`);
    const rowsAffected = await this.ResenaProfesionalRepository.updateAsync(entity);
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`ResenaProfesionalService.deleteByIdAsync(${id})`);
    const rowsAffected = await this.ResenaProfesionalRepository.deleteByIdAsync(id);
    return rowsAffected;
  };
}
