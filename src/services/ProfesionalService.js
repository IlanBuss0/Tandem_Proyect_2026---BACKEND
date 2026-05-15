import BaseCrudService from './BaseCrudService.js';
import ProfesionalRepository from '../repositories/ProfesionalRepository.js';
import VinculoService from './VinculoService.js';

class ProfesionalService extends BaseCrudService {
  constructor() {
    super(ProfesionalRepository, { hiddenFields: [] });
  }

  listPertenecientes(idProfesional) {
    return VinculoService.getPertenecientesByProfesional(idProfesional);
  }
}

export default new ProfesionalService();
