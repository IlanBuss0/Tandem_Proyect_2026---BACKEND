import ValidacionProfesionalRepository from '../repositories/ValidacionProfesionalRepository.js';

export default class ValidacionProfesionalService {
  constructor() {
    this.ValidacionProfesionalRepository = new ValidacionProfesionalRepository();
  }

  getAllAsync = async () => await this.ValidacionProfesionalRepository.getAllAsync();
  getByIdAsync = async (id) => await this.ValidacionProfesionalRepository.getByIdAsync(id);
  createAsync = async (entity) => await this.ValidacionProfesionalRepository.createAsync(entity);
  updateAsync = async (entity) => await this.ValidacionProfesionalRepository.updateAsync(entity);
  deleteByIdAsync = async (id) => await this.ValidacionProfesionalRepository.deleteByIdAsync(id);
}
