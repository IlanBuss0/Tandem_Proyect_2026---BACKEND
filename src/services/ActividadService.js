import BaseCrudService from './BaseCrudService.js';
import ActividadRepository from '../repositories/ActividadRepository.js';

class ActividadService extends BaseCrudService {
  constructor() {
    super(ActividadRepository, { hiddenFields: [] });
  }
}

export default new ActividadService();
