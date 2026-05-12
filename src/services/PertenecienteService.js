import BaseCrudService from './BaseCrudService.js';
import PertenecienteRepository from '../repositories/PertenecienteRepository.js';

class PertenecienteService extends BaseCrudService {
  constructor() {
    super(PertenecienteRepository, { hiddenFields: [] });
  }
}

export default new PertenecienteService();
