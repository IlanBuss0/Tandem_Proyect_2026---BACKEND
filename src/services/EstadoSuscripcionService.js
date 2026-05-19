import EstadoSuscripcionRepository from '../repositories/EstadoSuscripcionRepository.js';

export default class EstadoSuscripcionService {
  constructor() {
    console.log('Estoy en: EstadoSuscripcionService.constructor()');
    this.EstadoSuscripcionRepository = new EstadoSuscripcionRepository();
  }

  getAllAsync = async () => {
    console.log('EstadoSuscripcionService.getAllAsync()');
    const returnArray = await this.EstadoSuscripcionRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`EstadoSuscripcionService.getByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.EstadoSuscripcionRepository.getByIdAsync(id);
  };

  createAsync = async (entity) => {
    console.log(`EstadoSuscripcionService.createAsync(${JSON.stringify(entity)})`);
    if (!entity) throw new Error('La entidad es obligatoria.');
    return await this.EstadoSuscripcionRepository.createAsync(entity);
  };

  updateAsync = async (entity) => {
    console.log(`EstadoSuscripcionService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id es obligatorio para actualizar.');
    }
    const prev = await this.EstadoSuscripcionRepository.getByIdAsync(entity.id);
    if (prev == null) return 0;
    return await this.EstadoSuscripcionRepository.updateAsync(entity);
  };

  deleteByIdAsync = async (id) => {
    console.log(`EstadoSuscripcionService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.EstadoSuscripcionRepository.deleteByIdAsync(id);
  };
}
