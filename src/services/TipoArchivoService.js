import TipoArchivoRepository from '../repositories/TipoArchivoRepository.js';

export default class TipoArchivoService {
  constructor() {
    this.TipoArchivoRepository = new TipoArchivoRepository();
  }

  getAllAsync = async () => await this.TipoArchivoRepository.getAllAsync();
  getByIdAsync = async (id) => await this.TipoArchivoRepository.getByIdAsync(id);
  createAsync = async (entity) => await this.TipoArchivoRepository.createAsync(entity);
  updateAsync = async (entity) => await this.TipoArchivoRepository.updateAsync(entity);
  deleteByIdAsync = async (id) => await this.TipoArchivoRepository.deleteByIdAsync(id);
}
