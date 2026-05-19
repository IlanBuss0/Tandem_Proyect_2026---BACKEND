import CatalogoPermisoProfesionalRepository from '../repositories/CatalogoPermisoProfesionalRepository.js';

export default class CatalogoPermisoProfesionalService {
  constructor() {
    console.log('Estoy en: CatalogoPermisoProfesionalService.constructor()');
    this.CatalogoPermisoProfesionalRepository = new CatalogoPermisoProfesionalRepository();
  }

  getAllAsync = async () => {
    console.log('CatalogoPermisoProfesionalService.getAllAsync()');
    const returnArray = await this.CatalogoPermisoProfesionalRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`CatalogoPermisoProfesionalService.getByIdAsync(${id})`);
    const returnEntity = await this.CatalogoPermisoProfesionalRepository.getByIdAsync(id);
    return returnEntity;
  };

  createAsync = async (entity) => {
    console.log(`CatalogoPermisoProfesionalService.createAsync(${JSON.stringify(entity)})`);
    const newId = await this.CatalogoPermisoProfesionalRepository.createAsync(entity);
    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`CatalogoPermisoProfesionalService.updateAsync(${JSON.stringify(entity)})`);
    const rowsAffected = await this.CatalogoPermisoProfesionalRepository.updateAsync(entity);
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`CatalogoPermisoProfesionalService.deleteByIdAsync(${id})`);
    const rowsAffected = await this.CatalogoPermisoProfesionalRepository.deleteByIdAsync(id);
    return rowsAffected;
  };
}
