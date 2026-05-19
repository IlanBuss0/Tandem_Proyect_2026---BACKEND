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
    const returnEntity = await this.TipoChatRepository.getByIdAsync(id);
    return returnEntity;
  };

  createAsync = async (entity) => {
    console.log(`TipoChatService.createAsync(${JSON.stringify(entity)})`);
    const newId = await this.TipoChatRepository.createAsync(entity);
    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`TipoChatService.updateAsync(${JSON.stringify(entity)})`);
    const rowsAffected = await this.TipoChatRepository.updateAsync(entity);
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`TipoChatService.deleteByIdAsync(${id})`);
    const rowsAffected = await this.TipoChatRepository.deleteByIdAsync(id);
    return rowsAffected;
  };
}
