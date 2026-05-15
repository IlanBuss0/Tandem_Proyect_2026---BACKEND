import BaseCrudService from './BaseCrudService.js';
import ActividadRepository from '../repositories/ActividadRepository.js';

class ActividadService extends BaseCrudService {
  constructor() {
    super(ActividadRepository, { hiddenFields: [] });
  }

  async listByPerteneciente(id) { return this.repository.findByPerteneciente(id); }
  async listBase() { return this.repository.findBase(); }
  async listPersonalizadas() { return this.repository.findPersonalizadas(); }
  async listByCategoria(categoria) { return this.repository.findByCategoria(categoria); }
  async listByTipo(tipo) { return this.repository.findByTipo(tipo); }
}

export default new ActividadService();
