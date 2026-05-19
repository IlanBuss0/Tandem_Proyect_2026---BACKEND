import BeneficiarioSuscripcionRepository from '../repositories/BeneficiarioSuscripcionRepository.js';

export default class BeneficiarioSuscripcionService {
  constructor() {
    console.log('Estoy en: BeneficiarioSuscripcionService.constructor()');
    this.BeneficiarioSuscripcionRepository = new BeneficiarioSuscripcionRepository();
  }

  getAllAsync = async () => {
    console.log('BeneficiarioSuscripcionService.getAllAsync()');
    const returnArray = await this.BeneficiarioSuscripcionRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`BeneficiarioSuscripcionService.getByIdAsync(${id})`);
    const returnEntity = await this.BeneficiarioSuscripcionRepository.getByIdAsync(id);
    return returnEntity;
  };

  createAsync = async (entity) => {
    console.log(`BeneficiarioSuscripcionService.createAsync(${JSON.stringify(entity)})`);
    const newId = await this.BeneficiarioSuscripcionRepository.createAsync(entity);
    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`BeneficiarioSuscripcionService.updateAsync(${JSON.stringify(entity)})`);
    const rowsAffected = await this.BeneficiarioSuscripcionRepository.updateAsync(entity);
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`BeneficiarioSuscripcionService.deleteByIdAsync(${id})`);
    const rowsAffected = await this.BeneficiarioSuscripcionRepository.deleteByIdAsync(id);
    return rowsAffected;
  };
}
