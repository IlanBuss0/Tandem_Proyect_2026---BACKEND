import MensajeArchivoRepository from '../repositories/MensajeArchivoRepository.js';

export default class MensajeArchivoService {
  constructor() {
    this.MensajeArchivoRepository = new MensajeArchivoRepository();
  }

  getAllAsync = async () => await this.MensajeArchivoRepository.getAllAsync();
  getByIdAsync = async (id) => await this.MensajeArchivoRepository.getByIdAsync(id);
  createAsync = async (entity) => await this.MensajeArchivoRepository.createAsync(entity);
  updateAsync = async (entity) => await this.MensajeArchivoRepository.updateAsync(entity);
  deleteByIdAsync = async (id) => await this.MensajeArchivoRepository.deleteByIdAsync(id);
}
