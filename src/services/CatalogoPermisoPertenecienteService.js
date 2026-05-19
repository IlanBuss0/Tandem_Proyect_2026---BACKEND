import CatalogoPermisoPertenecienteRepository from '../repositories/CatalogoPermisoPertenecienteRepository.js';

export default class CatalogoPermisoPertenecienteService {
  constructor() {
    console.log('Estoy en: CatalogoPermisoPertenecienteService.constructor()');
    this.CatalogoPermisoPertenecienteRepository = new CatalogoPermisoPertenecienteRepository();
  }

  getAllAsync = async () => {
    console.log('CatalogoPermisoPertenecienteService.getAllAsync()');
    const returnArray = await this.CatalogoPermisoPertenecienteRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`CatalogoPermisoPertenecienteService.getByIdAsync(${id})`);
    const returnEntity = await this.CatalogoPermisoPertenecienteRepository.getByIdAsync(id);
    return returnEntity;
  };

  createAsync = async (entity) => {
    console.log(`CatalogoPermisoPertenecienteService.createAsync(${JSON.stringify(entity)})`);
    const newId = await this.CatalogoPermisoPertenecienteRepository.createAsync(entity);
    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`CatalogoPermisoPertenecienteService.updateAsync(${JSON.stringify(entity)})`);
    const rowsAffected = await this.CatalogoPermisoPertenecienteRepository.updateAsync(entity);
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`CatalogoPermisoPertenecienteService.deleteByIdAsync(${id})`);
    const rowsAffected = await this.CatalogoPermisoPertenecienteRepository.deleteByIdAsync(id);
    return rowsAffected;
  };
}
