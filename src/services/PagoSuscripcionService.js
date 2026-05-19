import PagoSuscripcionRepository from '../repositories/PagoSuscripcionRepository.js';

export default class PagoSuscripcionService {
  constructor() {
    console.log('Estoy en: PagoSuscripcionService.constructor()');
    this.PagoSuscripcionRepository = new PagoSuscripcionRepository();
  }

  getAllAsync = async () => {
    console.log('PagoSuscripcionService.getAllAsync()');
    const returnArray = await this.PagoSuscripcionRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`PagoSuscripcionService.getByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.PagoSuscripcionRepository.getByIdAsync(id);
  };

  createAsync = async (entity) => {
    console.log(`PagoSuscripcionService.createAsync(${JSON.stringify(entity)})`);
    if (!entity) throw new Error('La entidad es obligatoria.');
    return await this.PagoSuscripcionRepository.createAsync(entity);
  };

  updateAsync = async (entity) => {
    console.log(`PagoSuscripcionService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id es obligatorio para actualizar.');
    }
    const prev = await this.PagoSuscripcionRepository.getByIdAsync(entity.id);
    if (prev == null) return 0;
    return await this.PagoSuscripcionRepository.updateAsync(entity);
  };

  deleteByIdAsync = async (id) => {
    console.log(`PagoSuscripcionService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.PagoSuscripcionRepository.deleteByIdAsync(id);
  };
}
