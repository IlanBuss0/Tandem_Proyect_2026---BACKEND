import BaseCrudService from './BaseCrudService.js';
import TutorRepository from '../repositories/TutorRepository.js';
import VinculoService from './VinculoService.js';

class TutorService extends BaseCrudService {
  constructor() {
    super(TutorRepository, { hiddenFields: [] });
  }

  listPertenecientes(idTutor) {
    return VinculoService.getPertenecientesByTutor(idTutor);
  }
}

export default new TutorService();
