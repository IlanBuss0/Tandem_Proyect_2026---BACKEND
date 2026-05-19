import TipoUsuarioRepository from '../repositories/TipoUsuarioRepository.js';

export default class TipoUsuarioService {
  constructor() {
    this.TipoUsuarioRepository = new TipoUsuarioRepository();
  }

  getAllAsync = async () => await this.TipoUsuarioRepository.getAllAsync();
  getByIdAsync = async (id) => await this.TipoUsuarioRepository.getByIdAsync(id);
  createAsync = async (entity) => await this.TipoUsuarioRepository.createAsync(entity);
  updateAsync = async (entity) => await this.TipoUsuarioRepository.updateAsync(entity);
  deleteByIdAsync = async (id) => await this.TipoUsuarioRepository.deleteByIdAsync(id);
}
