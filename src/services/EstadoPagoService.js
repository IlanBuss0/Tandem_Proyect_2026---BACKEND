import EstadoPagoRepository from '../repositories/EstadoPagoRepository.js';

export default class EstadoPagoService {
  constructor() {
    console.log('Estoy en: EstadoPagoService.constructor()');
    this.EstadoPagoRepository = new EstadoPagoRepository();
  }

  getAllAsync = async () => {
    console.log('EstadoPagoService.getAllAsync()');
    const returnArray = await this.EstadoPagoRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`EstadoPagoService.getByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.EstadoPagoRepository.getByIdAsync(id);
  };

  createAsync = async (entity) => {
    console.log(`EstadoPagoService.createAsync(${JSON.stringify(entity)})`);
    if (!entity) throw new Error('La entidad es obligatoria.');
    return await this.EstadoPagoRepository.createAsync(entity);
  };

  updateAsync = async (entity) => {
    console.log(`EstadoPagoService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id es obligatorio para actualizar.');
    }
    const prev = await this.EstadoPagoRepository.getByIdAsync(entity.id);
    if (prev == null) return 0;
    return await this.EstadoPagoRepository.updateAsync(entity);
  };

  deleteByIdAsync = async (id) => {
    console.log(`EstadoPagoService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.EstadoPagoRepository.deleteByIdAsync(id);
  };
}
