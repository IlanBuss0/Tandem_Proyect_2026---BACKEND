import TipoMensajeRepository from '../repositories/TipoMensajeRepository.js';

export default class TipoMensajeService {
  constructor() {
    console.log('Estoy en: TipoMensajeService.constructor()');
    this.TipoMensajeRepository = new TipoMensajeRepository();
  }

  getAllAsync = async () => {
    console.log('TipoMensajeService.getAllAsync()');
    const returnArray = await this.TipoMensajeRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`TipoMensajeService.getByIdAsync(${id})`);
    const returnEntity = await this.TipoMensajeRepository.getByIdAsync(id);
    return returnEntity;
  };

  createAsync = async (entity) => {
    console.log(`TipoMensajeService.createAsync(${JSON.stringify(entity)})`);
    const newId = await this.TipoMensajeRepository.createAsync(entity);
    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`TipoMensajeService.updateAsync(${JSON.stringify(entity)})`);
    const rowsAffected = await this.TipoMensajeRepository.updateAsync(entity);
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`TipoMensajeService.deleteByIdAsync(${id})`);
    const rowsAffected = await this.TipoMensajeRepository.deleteByIdAsync(id);
    return rowsAffected;
  };
}
