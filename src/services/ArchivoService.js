import ArchivoRepository from '../repositories/ArchivoRepository.js';

export default class ArchivoService {
  constructor() {
    this.ArchivoRepository = new ArchivoRepository();
  }

  getAllAsync = async () => await this.ArchivoRepository.getAllAsync();
  getByIdAsync = async (id) => await this.ArchivoRepository.getByIdAsync(id);
  createAsync = async (entity) => await this.ArchivoRepository.createAsync(entity);
  updateAsync = async (entity) => await this.ArchivoRepository.updateAsync(entity);
  deleteByIdAsync = async (id) => await this.ArchivoRepository.deleteByIdAsync(id);
}
