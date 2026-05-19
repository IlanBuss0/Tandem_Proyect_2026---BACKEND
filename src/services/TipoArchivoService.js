import TipoArchivoRepository from '../repositories/TipoArchivoRepository.js';

export default class TipoArchivoService {
  constructor() {
    console.log('Estoy en: TipoArchivoService.constructor()');
    this.TipoArchivoRepository = new TipoArchivoRepository();
  }

  getAllAsync = async () => {
    console.log('TipoArchivoService.getAllAsync()');
    const returnArray = await this.TipoArchivoRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`TipoArchivoService.getByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.TipoArchivoRepository.getByIdAsync(id);
  };

  createAsync = async (entity) => {
    console.log(`TipoArchivoService.createAsync(${JSON.stringify(entity)})`);
    if (!entity) throw new Error('La entidad es obligatoria.');
    return await this.TipoArchivoRepository.createAsync(entity);
  };

  updateAsync = async (entity) => {
    console.log(`TipoArchivoService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id es obligatorio para actualizar.');
    }
    const prev = await this.TipoArchivoRepository.getByIdAsync(entity.id);
    if (prev == null) return 0;
    return await this.TipoArchivoRepository.updateAsync(entity);
  };

  deleteByIdAsync = async (id) => {
    console.log(`TipoArchivoService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.TipoArchivoRepository.deleteByIdAsync(id);
  };
}
