import AlcanceArchivoRepository from '../repositories/AlcanceArchivoRepository.js';

export default class AlcanceArchivoService {
  constructor() {
    this.AlcanceArchivoRepository = new AlcanceArchivoRepository();
  }

  getAllAsync = async () => await this.AlcanceArchivoRepository.getAllAsync();
  getByIdAsync = async (id) => await this.AlcanceArchivoRepository.getByIdAsync(id);
  createAsync = async (entity) => await this.AlcanceArchivoRepository.createAsync(entity);
  updateAsync = async (entity) => await this.AlcanceArchivoRepository.updateAsync(entity);
  deleteByIdAsync = async (id) => await this.AlcanceArchivoRepository.deleteByIdAsync(id);
}
