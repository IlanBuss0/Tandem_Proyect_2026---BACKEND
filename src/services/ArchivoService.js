import ArchivoRepository from '../repositories/ArchivoRepository.js';

export default class ArchivoService {
  constructor() {
    console.log('Estoy en: ArchivoService.constructor()');
    this.ArchivoRepository = new ArchivoRepository();
  }

  getAllAsync = async () => {
    console.log('ArchivoService.getAllAsync()');
    const returnArray = await this.ArchivoRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`ArchivoService.getByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.ArchivoRepository.getByIdAsync(id);
  };

  createAsync = async (entity) => {
    console.log(`ArchivoService.createAsync(${JSON.stringify(entity)})`);
    if (!entity) throw new Error('La entidad es obligatoria.');
    return await this.ArchivoRepository.createAsync(entity);
  };

  updateAsync = async (entity) => {
    console.log(`ArchivoService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id es obligatorio para actualizar.');
    }
    const prev = await this.ArchivoRepository.getByIdAsync(entity.id);
    if (prev == null) return 0;
    return await this.ArchivoRepository.updateAsync(entity);
  };

  deleteByIdAsync = async (id) => {
    console.log(`ArchivoService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.ArchivoRepository.deleteByIdAsync(id);
  };
}
