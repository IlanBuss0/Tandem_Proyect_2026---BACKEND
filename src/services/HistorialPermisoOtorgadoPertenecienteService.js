import HistorialPermisoOtorgadoPertenecienteRepository from '../repositories/HistorialPermisoOtorgadoPertenecienteRepository.js';

export default class HistorialPermisoOtorgadoPertenecienteService {
  constructor() {
    console.log('Estoy en: HistorialPermisoOtorgadoPertenecienteService.constructor()');
    this.HistorialPermisoOtorgadoPertenecienteRepository = new HistorialPermisoOtorgadoPertenecienteRepository();
  }

  getAllAsync = async () => {
    console.log('HistorialPermisoOtorgadoPertenecienteService.getAllAsync()');
    const returnArray = await this.HistorialPermisoOtorgadoPertenecienteRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`HistorialPermisoOtorgadoPertenecienteService.getByIdAsync(${id})`);
    const returnEntity = await this.HistorialPermisoOtorgadoPertenecienteRepository.getByIdAsync(id);
    return returnEntity;
  };

  createAsync = async (entity) => {
    console.log(`HistorialPermisoOtorgadoPertenecienteService.createAsync(${JSON.stringify(entity)})`);
    const newId = await this.HistorialPermisoOtorgadoPertenecienteRepository.createAsync(entity);
    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`HistorialPermisoOtorgadoPertenecienteService.updateAsync(${JSON.stringify(entity)})`);
    const rowsAffected = await this.HistorialPermisoOtorgadoPertenecienteRepository.updateAsync(entity);
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`HistorialPermisoOtorgadoPertenecienteService.deleteByIdAsync(${id})`);
    const rowsAffected = await this.HistorialPermisoOtorgadoPertenecienteRepository.deleteByIdAsync(id);
    return rowsAffected;
  };
}
