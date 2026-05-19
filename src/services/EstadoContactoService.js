import EstadoContactoRepository from '../repositories/EstadoContactoRepository.js';

export default class EstadoContactoService {
  constructor() {
    console.log('Estoy en: EstadoContactoService.constructor()');
    this.EstadoContactoRepository = new EstadoContactoRepository();
  }

  getAllAsync = async () => {
    console.log('EstadoContactoService.getAllAsync()');
    const returnArray = await this.EstadoContactoRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`EstadoContactoService.getByIdAsync(${id})`);
    const returnEntity = await this.EstadoContactoRepository.getByIdAsync(id);
    return returnEntity;
  };

  createAsync = async (entity) => {
    console.log(`EstadoContactoService.createAsync(${JSON.stringify(entity)})`);
    const newId = await this.EstadoContactoRepository.createAsync(entity);
    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`EstadoContactoService.updateAsync(${JSON.stringify(entity)})`);
    const rowsAffected = await this.EstadoContactoRepository.updateAsync(entity);
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`EstadoContactoService.deleteByIdAsync(${id})`);
    const rowsAffected = await this.EstadoContactoRepository.deleteByIdAsync(id);
    return rowsAffected;
  };
}
