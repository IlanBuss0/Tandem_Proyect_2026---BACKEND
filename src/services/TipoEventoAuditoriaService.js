import TipoEventoAuditoriaRepository from '../repositories/TipoEventoAuditoriaRepository.js';

export default class TipoEventoAuditoriaService {
  constructor() {
    console.log('Estoy en: TipoEventoAuditoriaService.constructor()');
    this.TipoEventoAuditoriaRepository = new TipoEventoAuditoriaRepository();
  }

  getAllAsync = async () => {
    console.log('TipoEventoAuditoriaService.getAllAsync()');
    const returnArray = await this.TipoEventoAuditoriaRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`TipoEventoAuditoriaService.getByIdAsync(${id})`);
    const returnEntity = await this.TipoEventoAuditoriaRepository.getByIdAsync(id);
    return returnEntity;
  };

  createAsync = async (entity) => {
    console.log(`TipoEventoAuditoriaService.createAsync(${JSON.stringify(entity)})`);
    const newId = await this.TipoEventoAuditoriaRepository.createAsync(entity);
    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`TipoEventoAuditoriaService.updateAsync(${JSON.stringify(entity)})`);
    const rowsAffected = await this.TipoEventoAuditoriaRepository.updateAsync(entity);
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`TipoEventoAuditoriaService.deleteByIdAsync(${id})`);
    const rowsAffected = await this.TipoEventoAuditoriaRepository.deleteByIdAsync(id);
    return rowsAffected;
  };
}
