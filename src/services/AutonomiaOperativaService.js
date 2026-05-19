import AutonomiaOperativaRepository from '../repositories/AutonomiaOperativaRepository.js';

export default class AutonomiaOperativaService {
  constructor() {
    console.log('Estoy en: AutonomiaOperativaService.constructor()');
    this.AutonomiaOperativaRepository = new AutonomiaOperativaRepository();
  }

  getAllAsync = async () => {
    console.log('AutonomiaOperativaService.getAllAsync()');
    const returnArray = await this.AutonomiaOperativaRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`AutonomiaOperativaService.getByIdAsync(${id})`);
    const returnEntity = await this.AutonomiaOperativaRepository.getByIdAsync(id);
    return returnEntity;
  };

  createAsync = async (entity) => {
    console.log(`AutonomiaOperativaService.createAsync(${JSON.stringify(entity)})`);
    const newId = await this.AutonomiaOperativaRepository.createAsync(entity);
    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`AutonomiaOperativaService.updateAsync(${JSON.stringify(entity)})`);
    const rowsAffected = await this.AutonomiaOperativaRepository.updateAsync(entity);
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`AutonomiaOperativaService.deleteByIdAsync(${id})`);
    const rowsAffected = await this.AutonomiaOperativaRepository.deleteByIdAsync(id);
    return rowsAffected;
  };
}
