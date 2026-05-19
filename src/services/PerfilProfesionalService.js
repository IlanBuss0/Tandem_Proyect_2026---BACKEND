import PerfilProfesionalRepository from '../repositories/PerfilProfesionalRepository.js';

export default class PerfilProfesionalService {
  constructor() {
    console.log('Estoy en: PerfilProfesionalService.constructor()');
    this.PerfilProfesionalRepository = new PerfilProfesionalRepository();
  }

  getAllAsync = async () => {
    console.log('PerfilProfesionalService.getAllAsync()');
    const returnArray = await this.PerfilProfesionalRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`PerfilProfesionalService.getByIdAsync(${id})`);
    const returnEntity = await this.PerfilProfesionalRepository.getByIdAsync(id);
    return returnEntity;
  };

  createAsync = async (entity) => {
    console.log(`PerfilProfesionalService.createAsync(${JSON.stringify(entity)})`);
    const newId = await this.PerfilProfesionalRepository.createAsync(entity);
    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`PerfilProfesionalService.updateAsync(${JSON.stringify(entity)})`);
    const rowsAffected = await this.PerfilProfesionalRepository.updateAsync(entity);
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`PerfilProfesionalService.deleteByIdAsync(${id})`);
    const rowsAffected = await this.PerfilProfesionalRepository.deleteByIdAsync(id);
    return rowsAffected;
  };
}
