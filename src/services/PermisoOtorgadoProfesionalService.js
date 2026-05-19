import PermisoOtorgadoProfesionalRepository from '../repositories/PermisoOtorgadoProfesionalRepository.js';

export default class PermisoOtorgadoProfesionalService {
  constructor() {
    this.PermisoOtorgadoProfesionalRepository = new PermisoOtorgadoProfesionalRepository();
  }

  getAllAsync = async () => await this.PermisoOtorgadoProfesionalRepository.getAllAsync();
  getByIdAsync = async (id) => await this.PermisoOtorgadoProfesionalRepository.getByIdAsync(id);
  createAsync = async (entity) => await this.PermisoOtorgadoProfesionalRepository.createAsync(entity);
  updateAsync = async (entity) => await this.PermisoOtorgadoProfesionalRepository.updateAsync(entity);
  deleteByIdAsync = async (id) => await this.PermisoOtorgadoProfesionalRepository.deleteByIdAsync(id);
}
