import PaquetePuntoRepository from '../repositories/PaquetePuntoRepository.js';

export default class PaquetePuntoService {
  constructor() {
    console.log('Estoy en: PaquetePuntoService.constructor()');
    this.PaquetePuntoRepository = new PaquetePuntoRepository();
  }

  getAllAsync = async () => {
    console.log('PaquetePuntoService.getAllAsync()');
    const returnArray = await this.PaquetePuntoRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`PaquetePuntoService.getByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.PaquetePuntoRepository.getByIdAsync(id);
  };

  createAsync = async (entity) => {
    console.log(`PaquetePuntoService.createAsync(${JSON.stringify(entity)})`);
    if (!entity) throw new Error('La entidad es obligatoria.');
    return await this.PaquetePuntoRepository.createAsync(entity);
  };

  updateAsync = async (entity) => {
    console.log(`PaquetePuntoService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id es obligatorio para actualizar.');
    }
    const prev = await this.PaquetePuntoRepository.getByIdAsync(entity.id);
    if (prev == null) return 0;
    return await this.PaquetePuntoRepository.updateAsync(entity);
  };

  deleteByIdAsync = async (id) => {
    console.log(`PaquetePuntoService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.PaquetePuntoRepository.deleteByIdAsync(id);
  };
}
