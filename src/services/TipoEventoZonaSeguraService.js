import TipoEventoZonaSeguraRepository from '../repositories/TipoEventoZonaSeguraRepository.js';

export default class TipoEventoZonaSeguraService {
  constructor() {
    console.log('Estoy en: TipoEventoZonaSeguraService.constructor()');
    this.TipoEventoZonaSeguraRepository = new TipoEventoZonaSeguraRepository();
  }

  getAllAsync = async () => {
    console.log('TipoEventoZonaSeguraService.getAllAsync()');
    const returnArray = await this.TipoEventoZonaSeguraRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`TipoEventoZonaSeguraService.getByIdAsync(${id})`);
    const returnEntity = await this.TipoEventoZonaSeguraRepository.getByIdAsync(id);
    return returnEntity;
  };

  createAsync = async (entity) => {
    console.log(`TipoEventoZonaSeguraService.createAsync(${JSON.stringify(entity)})`);
    const newId = await this.TipoEventoZonaSeguraRepository.createAsync(entity);
    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`TipoEventoZonaSeguraService.updateAsync(${JSON.stringify(entity)})`);
    const rowsAffected = await this.TipoEventoZonaSeguraRepository.updateAsync(entity);
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`TipoEventoZonaSeguraService.deleteByIdAsync(${id})`);
    const rowsAffected = await this.TipoEventoZonaSeguraRepository.deleteByIdAsync(id);
    return rowsAffected;
  };
}
