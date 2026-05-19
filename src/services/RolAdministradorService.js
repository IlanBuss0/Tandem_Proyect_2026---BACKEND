import RolAdministradorRepository from '../repositories/RolAdministradorRepository.js';

export default class RolAdministradorService {
  constructor() {
    this.RolAdministradorRepository = new RolAdministradorRepository();
  }

  getAllAsync = async () => await this.RolAdministradorRepository.getAllAsync();
  getByIdAsync = async (id) => await this.RolAdministradorRepository.getByIdAsync(id);
  createAsync = async (entity) => await this.RolAdministradorRepository.createAsync(entity);
  updateAsync = async (entity) => await this.RolAdministradorRepository.updateAsync(entity);
  deleteByIdAsync = async (id) => await this.RolAdministradorRepository.deleteByIdAsync(id);
}
