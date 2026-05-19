import VinculoProfesionalPertenecienteRepository from '../repositories/VinculoProfesionalPertenecienteRepository.js';

export default class VinculoProfesionalPertenecienteService {
  constructor() {
    console.log('Estoy en: VinculoProfesionalPertenecienteService.constructor()');
    this.VinculoProfesionalPertenecienteRepository = new VinculoProfesionalPertenecienteRepository();
  }

  getAllAsync = async () => {
    console.log('VinculoProfesionalPertenecienteService.getAllAsync()');
    const returnArray = await this.VinculoProfesionalPertenecienteRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`VinculoProfesionalPertenecienteService.getByIdAsync(${id})`);
    const returnEntity = await this.VinculoProfesionalPertenecienteRepository.getByIdAsync(id);
    return returnEntity;
  };

  createAsync = async (entity) => {
    console.log(`VinculoProfesionalPertenecienteService.createAsync(${JSON.stringify(entity)})`);
    const newId = await this.VinculoProfesionalPertenecienteRepository.createAsync(entity);
    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`VinculoProfesionalPertenecienteService.updateAsync(${JSON.stringify(entity)})`);
    const rowsAffected = await this.VinculoProfesionalPertenecienteRepository.updateAsync(entity);
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`VinculoProfesionalPertenecienteService.deleteByIdAsync(${id})`);
    const rowsAffected = await this.VinculoProfesionalPertenecienteRepository.deleteByIdAsync(id);
    return rowsAffected;
  };
}
