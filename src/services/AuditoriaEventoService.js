import AuditoriaEventoRepository from '../repositories/AuditoriaEventoRepository.js';

export default class AuditoriaEventoService {
  constructor() {
    console.log('Estoy en: AuditoriaEventoService.constructor()');
    this.AuditoriaEventoRepository = new AuditoriaEventoRepository();
  }

  getAllAsync = async () => {
    console.log('AuditoriaEventoService.getAllAsync()');
    const returnArray = await this.AuditoriaEventoRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`AuditoriaEventoService.getByIdAsync(${id})`);
    const returnEntity = await this.AuditoriaEventoRepository.getByIdAsync(id);
    return returnEntity;
  };

  createAsync = async (entity) => {
    console.log(`AuditoriaEventoService.createAsync(${JSON.stringify(entity)})`);
    const newId = await this.AuditoriaEventoRepository.createAsync(entity);
    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`AuditoriaEventoService.updateAsync(${JSON.stringify(entity)})`);
    const rowsAffected = await this.AuditoriaEventoRepository.updateAsync(entity);
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`AuditoriaEventoService.deleteByIdAsync(${id})`);
    const rowsAffected = await this.AuditoriaEventoRepository.deleteByIdAsync(id);
    return rowsAffected;
  };
}
