import BaseCrudService from './BaseCrudService.js';
import RutinaRepository from '../repositories/RutinaRepository.js';

class RutinaService extends BaseCrudService {
  constructor() {
    super(RutinaRepository, { hiddenFields: [] });
  }
}

export default new RutinaService();
