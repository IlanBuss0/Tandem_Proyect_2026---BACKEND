import TipoEventoZonaSeguraRepository from '../repositories/TipoEventoZonaSeguraRepository.js';

export default class TipoEventoZonaSeguraService {
  constructor() {
    this.TipoEventoZonaSeguraRepository = new TipoEventoZonaSeguraRepository();
  }

  getAllAsync = async () => await this.TipoEventoZonaSeguraRepository.getAllAsync();
  getByIdAsync = async (id) => await this.TipoEventoZonaSeguraRepository.getByIdAsync(id);
  createAsync = async (entity) => await this.TipoEventoZonaSeguraRepository.createAsync(entity);
  updateAsync = async (entity) => await this.TipoEventoZonaSeguraRepository.updateAsync(entity);
  deleteByIdAsync = async (id) => await this.TipoEventoZonaSeguraRepository.deleteByIdAsync(id);
}
