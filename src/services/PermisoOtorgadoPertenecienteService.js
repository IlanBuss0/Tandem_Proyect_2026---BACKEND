import PermisoOtorgadoPertenecienteRepository from '../repositories/PermisoOtorgadoPertenecienteRepository.js';

export default class PermisoOtorgadoPertenecienteService {
  constructor() {
    console.log('Estoy en: PermisoOtorgadoPertenecienteService.constructor()');
    this.PermisoOtorgadoPertenecienteRepository = new PermisoOtorgadoPertenecienteRepository();
  }

  getAllAsync = async () => {
    console.log('PermisoOtorgadoPertenecienteService.getAllAsync()');
    const returnArray = await this.PermisoOtorgadoPertenecienteRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`PermisoOtorgadoPertenecienteService.getByIdAsync(${id})`);
    const returnEntity = await this.PermisoOtorgadoPertenecienteRepository.getByIdAsync(id);
    return returnEntity;
  };

  createAsync = async (entity) => {
    console.log(`PermisoOtorgadoPertenecienteService.createAsync(${JSON.stringify(entity)})`);
    const newId = await this.PermisoOtorgadoPertenecienteRepository.createAsync(entity);
    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`PermisoOtorgadoPertenecienteService.updateAsync(${JSON.stringify(entity)})`);
    const rowsAffected = await this.PermisoOtorgadoPertenecienteRepository.updateAsync(entity);
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`PermisoOtorgadoPertenecienteService.deleteByIdAsync(${id})`);
    const rowsAffected = await this.PermisoOtorgadoPertenecienteRepository.deleteByIdAsync(id);
    return rowsAffected;
  };
}
