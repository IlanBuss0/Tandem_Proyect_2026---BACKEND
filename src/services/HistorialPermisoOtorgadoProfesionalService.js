import HistorialPermisoOtorgadoProfesionalRepository from '../repositories/HistorialPermisoOtorgadoProfesionalRepository.js';

export default class HistorialPermisoOtorgadoProfesionalService {
  constructor() {
    console.log('Estoy en: HistorialPermisoOtorgadoProfesionalService.constructor()');
    this.HistorialPermisoOtorgadoProfesionalRepository = new HistorialPermisoOtorgadoProfesionalRepository();
  }

  getAllAsync = async () => {
    console.log('HistorialPermisoOtorgadoProfesionalService.getAllAsync()');
    const returnArray = await this.HistorialPermisoOtorgadoProfesionalRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`HistorialPermisoOtorgadoProfesionalService.getByIdAsync(${id})`);
    const returnEntity = await this.HistorialPermisoOtorgadoProfesionalRepository.getByIdAsync(id);
    return returnEntity;
  };

  createAsync = async (entity) => {
    console.log(`HistorialPermisoOtorgadoProfesionalService.createAsync(${JSON.stringify(entity)})`);
    const newId = await this.HistorialPermisoOtorgadoProfesionalRepository.createAsync(entity);
    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`HistorialPermisoOtorgadoProfesionalService.updateAsync(${JSON.stringify(entity)})`);
    const rowsAffected = await this.HistorialPermisoOtorgadoProfesionalRepository.updateAsync(entity);
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`HistorialPermisoOtorgadoProfesionalService.deleteByIdAsync(${id})`);
    const rowsAffected = await this.HistorialPermisoOtorgadoProfesionalRepository.deleteByIdAsync(id);
    return rowsAffected;
  };
}
