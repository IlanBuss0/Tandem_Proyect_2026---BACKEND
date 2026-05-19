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
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.BeneficiarioSuscripcionRepository.getByIdAsync(id);
  };

  createAsync = async (entity) => {
    console.log(`BeneficiarioSuscripcionService.createAsync(${JSON.stringify(entity)})`);
    if (!entity) throw new Error('La entidad es obligatoria.');
    return await this.BeneficiarioSuscripcionRepository.createAsync(entity);
  };

  updateAsync = async (entity) => {
    console.log(`BeneficiarioSuscripcionService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id es obligatorio para actualizar.');
    }
    const prev = await this.BeneficiarioSuscripcionRepository.getByIdAsync(entity.id);
    if (prev == null) return 0;
    return await this.BeneficiarioSuscripcionRepository.updateAsync(entity);
  };

  deleteByIdAsync = async (id) => {
    console.log(`BeneficiarioSuscripcionService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.BeneficiarioSuscripcionRepository.deleteByIdAsync(id);
  };
}
