import TipoMovimientoPuntoRepository from '../repositories/TipoMovimientoPuntoRepository.js';

export default class TipoMovimientoPuntoService {
  constructor() {
    this.TipoMovimientoPuntoRepository = new TipoMovimientoPuntoRepository();
  }

  getAllAsync = async () => await this.TipoMovimientoPuntoRepository.getAllAsync();
  getByIdAsync = async (id) => await this.TipoMovimientoPuntoRepository.getByIdAsync(id);
  createAsync = async (entity) => await this.TipoMovimientoPuntoRepository.createAsync(entity);
  updateAsync = async (entity) => await this.TipoMovimientoPuntoRepository.updateAsync(entity);
  deleteByIdAsync = async (id) => await this.TipoMovimientoPuntoRepository.deleteByIdAsync(id);
}
