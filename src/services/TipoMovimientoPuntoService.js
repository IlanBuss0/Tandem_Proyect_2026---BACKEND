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
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.TipoMovimientoPuntoRepository.getByIdAsync(id);
  };

  createAsync = async (entity) => {
    console.log(`TipoMovimientoPuntoService.createAsync(${JSON.stringify(entity)})`);
    if (!entity) throw new Error('La entidad es obligatoria.');
    return await this.TipoMovimientoPuntoRepository.createAsync(entity);
  };

  updateAsync = async (entity) => {
    console.log(`TipoMovimientoPuntoService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id es obligatorio para actualizar.');
    }
    const prev = await this.TipoMovimientoPuntoRepository.getByIdAsync(entity.id);
    if (prev == null) return 0;
    return await this.TipoMovimientoPuntoRepository.updateAsync(entity);
  };

  deleteByIdAsync = async (id) => {
    console.log(`TipoMovimientoPuntoService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.TipoMovimientoPuntoRepository.deleteByIdAsync(id);
  };
}
