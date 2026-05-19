import TipoMovimientoPuntoRepository from '../repositories/TipoMovimientoPuntoRepository.js';

export default class TipoMovimientoPuntoService {
  constructor() {
    console.log('Estoy en: TipoMovimientoPuntoService.constructor()');
    this.TipoMovimientoPuntoRepository = new TipoMovimientoPuntoRepository();
  }

  getAllAsync = async () => {
    console.log('TipoMovimientoPuntoService.getAllAsync()');
    const returnArray = await this.TipoMovimientoPuntoRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`TipoMovimientoPuntoService.getByIdAsync(${id})`);
    const returnEntity = await this.TipoMovimientoPuntoRepository.getByIdAsync(id);
    return returnEntity;
  };

  createAsync = async (entity) => {
    console.log(`TipoMovimientoPuntoService.createAsync(${JSON.stringify(entity)})`);
    const newId = await this.TipoMovimientoPuntoRepository.createAsync(entity);
    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`TipoMovimientoPuntoService.updateAsync(${JSON.stringify(entity)})`);
    const rowsAffected = await this.TipoMovimientoPuntoRepository.updateAsync(entity);
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`TipoMovimientoPuntoService.deleteByIdAsync(${id})`);
    const rowsAffected = await this.TipoMovimientoPuntoRepository.deleteByIdAsync(id);
    return rowsAffected;
  };
}
