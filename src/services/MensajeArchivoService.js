import MensajeArchivoRepository from '../repositories/MensajeArchivoRepository.js';

export default class MensajeArchivoService {
  constructor() {
    console.log('Estoy en: MensajeArchivoService.constructor()');
    this.MensajeArchivoRepository = new MensajeArchivoRepository();
  }

  getAllAsync = async () => {
    console.log('MensajeArchivoService.getAllAsync()');
    const returnArray = await this.MensajeArchivoRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`MensajeArchivoService.getByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.MensajeArchivoRepository.getByIdAsync(id);
  };

  createAsync = async (entity) => {
    console.log(`MensajeArchivoService.createAsync(${JSON.stringify(entity)})`);
    if (!entity) throw new Error('La entidad es obligatoria.');
    return await this.MensajeArchivoRepository.createAsync(entity);
  };

  updateAsync = async (entity) => {
    console.log(`MensajeArchivoService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id es obligatorio para actualizar.');
    }
    const prev = await this.MensajeArchivoRepository.getByIdAsync(entity.id);
    if (prev == null) return 0;
    return await this.MensajeArchivoRepository.updateAsync(entity);
  };

  deleteByIdAsync = async (id) => {
    console.log(`MensajeArchivoService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.MensajeArchivoRepository.deleteByIdAsync(id);
  };
}
