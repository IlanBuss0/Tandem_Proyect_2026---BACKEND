import NivelApoyoRepository from '../repositories/NivelApoyoRepository.js';

export default class NivelApoyoService {
  constructor() {
    this.NivelApoyoRepository = new NivelApoyoRepository();
  }

  getAllAsync = async () => await this.NivelApoyoRepository.getAllAsync();
  getByIdAsync = async (id) => await this.NivelApoyoRepository.getByIdAsync(id);
  createAsync = async (entity) => await this.NivelApoyoRepository.createAsync(entity);
  updateAsync = async (entity) => await this.NivelApoyoRepository.updateAsync(entity);
  deleteByIdAsync = async (id) => await this.NivelApoyoRepository.deleteByIdAsync(id);
}
