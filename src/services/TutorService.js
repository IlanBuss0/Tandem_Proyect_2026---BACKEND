import BaseCrudService from './BaseCrudService.js';
import TutorRepository from '../repositories/TutorRepository.js';

class TutorService extends BaseCrudService {
  constructor() {
    super(TutorRepository, { hiddenFields: [] });
  }
}

export default new TutorService();
