import TipoChatRepository from '../repositories/TipoChatRepository.js';

export default class TipoChatService {
  constructor() {
    console.log('Estoy en: TipoChatService.constructor()');
    this.TipoChatRepository = new TipoChatRepository();
  }

  getAllAsync = async () => {
    console.log('TipoChatService.getAllAsync()');
    const returnArray = await this.TipoChatRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`TipoChatService.getByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.TipoChatRepository.getByIdAsync(id);
  };

  createAsync = async (entity) => {
    console.log(`TipoChatService.createAsync(${JSON.stringify(entity)})`);
    if (!entity) throw new Error('La entidad es obligatoria.');
    return await this.TipoChatRepository.createAsync(entity);
  };

  updateAsync = async (entity) => {
    console.log(`TipoChatService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id es obligatorio para actualizar.');
    }
    const prev = await this.TipoChatRepository.getByIdAsync(entity.id);
    if (prev == null) return 0;
    return await this.TipoChatRepository.updateAsync(entity);
  };

  deleteByIdAsync = async (id) => {
    console.log(`TipoChatService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.TipoChatRepository.deleteByIdAsync(id);
  };
}
