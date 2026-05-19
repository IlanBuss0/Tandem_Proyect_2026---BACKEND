import RolAdministradorRepository from '../repositories/RolAdministradorRepository.js';

export default class RolAdministradorService {
  constructor() {
    console.log('Estoy en: RolAdministradorService.constructor()');
    this.RolAdministradorRepository = new RolAdministradorRepository();
  }

  getAllAsync = async () => {
    console.log('RolAdministradorService.getAllAsync()');
    const returnArray = await this.RolAdministradorRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`RolAdministradorService.getByIdAsync(${id})`);
    const returnEntity = await this.RolAdministradorRepository.getByIdAsync(id);
    return returnEntity;
  };

  createAsync = async (entity) => {
    console.log(`RolAdministradorService.createAsync(${JSON.stringify(entity)})`);
    const newId = await this.RolAdministradorRepository.createAsync(entity);
    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`RolAdministradorService.updateAsync(${JSON.stringify(entity)})`);
    const rowsAffected = await this.RolAdministradorRepository.updateAsync(entity);
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`RolAdministradorService.deleteByIdAsync(${id})`);
    const rowsAffected = await this.RolAdministradorRepository.deleteByIdAsync(id);
    return rowsAffected;
  };
}
