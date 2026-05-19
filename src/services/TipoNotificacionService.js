import TipoNotificacionRepository from '../repositories/TipoNotificacionRepository.js';

export default class TipoNotificacionService {
  constructor() {
    console.log('Estoy en: TipoNotificacionService.constructor()');
    this.TipoNotificacionRepository = new TipoNotificacionRepository();
  }

  getAllAsync = async () => {
    console.log('TipoNotificacionService.getAllAsync()');
    const returnArray = await this.TipoNotificacionRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`TipoNotificacionService.getByIdAsync(${id})`);
    const returnEntity = await this.TipoNotificacionRepository.getByIdAsync(id);
    return returnEntity;
  };

  createAsync = async (entity) => {
    console.log(`TipoNotificacionService.createAsync(${JSON.stringify(entity)})`);
    const newId = await this.TipoNotificacionRepository.createAsync(entity);
    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`TipoNotificacionService.updateAsync(${JSON.stringify(entity)})`);
    const rowsAffected = await this.TipoNotificacionRepository.updateAsync(entity);
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`TipoNotificacionService.deleteByIdAsync(${id})`);
    const rowsAffected = await this.TipoNotificacionRepository.deleteByIdAsync(id);
    return rowsAffected;
  };
}
