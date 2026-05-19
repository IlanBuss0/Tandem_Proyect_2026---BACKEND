import EstadoVinculoRepository from '../repositories/EstadoVinculoRepository.js';

export default class EstadoVinculoService {
  constructor() {
    console.log('Estoy en: EstadoVinculoService.constructor()');
    this.EstadoVinculoRepository = new EstadoVinculoRepository();
  }

  getAllAsync = async () => {
    console.log('EstadoVinculoService.getAllAsync()');
    const returnArray = await this.EstadoVinculoRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`EstadoVinculoService.getByIdAsync(${id})`);
    const returnEntity = await this.EstadoVinculoRepository.getByIdAsync(id);
    return returnEntity;
  };

  createAsync = async (entity) => {
    console.log(`EstadoVinculoService.createAsync(${JSON.stringify(entity)})`);
    const newId = await this.EstadoVinculoRepository.createAsync(entity);
    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`EstadoVinculoService.updateAsync(${JSON.stringify(entity)})`);
    const rowsAffected = await this.EstadoVinculoRepository.updateAsync(entity);
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`EstadoVinculoService.deleteByIdAsync(${id})`);
    const rowsAffected = await this.EstadoVinculoRepository.deleteByIdAsync(id);
    return rowsAffected;
  };
}
