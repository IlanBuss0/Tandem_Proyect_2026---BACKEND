import BaseCrudService from './BaseCrudService.js';
import ProfesionalRepository from '../repositories/ProfesionalRepository.js';

class ProfesionalService extends BaseCrudService {
  constructor() {
    super(ProfesionalRepository, { hiddenFields: [] });
  }
}

export default new ProfesionalService();
