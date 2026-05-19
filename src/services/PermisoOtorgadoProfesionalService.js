import PermisoOtorgadoProfesionalRepository from '../repositories/PermisoOtorgadoProfesionalRepository.js';

export default class PermisoOtorgadoProfesionalService {
  constructor() {
    console.log('Estoy en: PermisoOtorgadoProfesionalService.constructor()');
    this.PermisoOtorgadoProfesionalRepository = new PermisoOtorgadoProfesionalRepository();
  }

  getAllAsync = async () => {
    console.log('PermisoOtorgadoProfesionalService.getAllAsync()');
    const returnArray = await this.PermisoOtorgadoProfesionalRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`PermisoOtorgadoProfesionalService.getByIdAsync(${id})`);
    const returnEntity = await this.PermisoOtorgadoProfesionalRepository.getByIdAsync(id);
    return returnEntity;
  };

  createAsync = async (entity) => {
    console.log(`PermisoOtorgadoProfesionalService.createAsync(${JSON.stringify(entity)})`);
    const newId = await this.PermisoOtorgadoProfesionalRepository.createAsync(entity);
    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`PermisoOtorgadoProfesionalService.updateAsync(${JSON.stringify(entity)})`);
    const rowsAffected = await this.PermisoOtorgadoProfesionalRepository.updateAsync(entity);
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`PermisoOtorgadoProfesionalService.deleteByIdAsync(${id})`);
    const rowsAffected = await this.PermisoOtorgadoProfesionalRepository.deleteByIdAsync(id);
    return rowsAffected;
  };
}
