import AlcanceArchivoRepository from '../repositories/AlcanceArchivoRepository.js';

export default class AlcanceArchivoService {
  constructor() {
    console.log('Estoy en: AlcanceArchivoService.constructor()');
    this.AlcanceArchivoRepository = new AlcanceArchivoRepository();
  }

  getAllAsync = async () => {
    console.log('AlcanceArchivoService.getAllAsync()');
    const returnArray = await this.AlcanceArchivoRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`AlcanceArchivoService.getByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.AlcanceArchivoRepository.getByIdAsync(id);
  };

  createAsync = async (entity) => {
    console.log(`AlcanceArchivoService.createAsync(${JSON.stringify(entity)})`);
    if (!entity) throw new Error('La entidad es obligatoria.');
    return await this.AlcanceArchivoRepository.createAsync(entity);
  };

  updateAsync = async (entity) => {
    console.log(`AlcanceArchivoService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id es obligatorio para actualizar.');
    }
    const prev = await this.AlcanceArchivoRepository.getByIdAsync(entity.id);
    if (prev == null) return 0;
    return await this.AlcanceArchivoRepository.updateAsync(entity);
  };

  deleteByIdAsync = async (id) => {
    console.log(`AlcanceArchivoService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.AlcanceArchivoRepository.deleteByIdAsync(id);
  };
}
