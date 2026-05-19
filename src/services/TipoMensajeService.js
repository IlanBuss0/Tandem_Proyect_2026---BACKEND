import TipoMensajeRepository from '../repositories/TipoMensajeRepository.js';

export default class TipoMensajeService {
  constructor() {
    this.TipoMensajeRepository = new TipoMensajeRepository();
  }

  getAllAsync = async () => await this.TipoMensajeRepository.getAllAsync();
  getByIdAsync = async (id) => await this.TipoMensajeRepository.getByIdAsync(id);
  createAsync = async (entity) => await this.TipoMensajeRepository.createAsync(entity);
  updateAsync = async (entity) => await this.TipoMensajeRepository.updateAsync(entity);
  deleteByIdAsync = async (id) => await this.TipoMensajeRepository.deleteByIdAsync(id);
}
