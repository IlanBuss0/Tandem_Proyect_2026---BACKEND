import CatalogoPermisoProfesionalRepository from '../repositories/CatalogoPermisoProfesionalRepository.js';

export default class CatalogoPermisoProfesionalService {
  constructor() {
    this.CatalogoPermisoProfesionalRepository = new CatalogoPermisoProfesionalRepository();
  }

  getAllAsync = async () => await this.CatalogoPermisoProfesionalRepository.getAllAsync();
  getByIdAsync = async (id) => await this.CatalogoPermisoProfesionalRepository.getByIdAsync(id);
  createAsync = async (entity) => await this.CatalogoPermisoProfesionalRepository.createAsync(entity);
  updateAsync = async (entity) => await this.CatalogoPermisoProfesionalRepository.updateAsync(entity);
  deleteByIdAsync = async (id) => await this.CatalogoPermisoProfesionalRepository.deleteByIdAsync(id);
}
