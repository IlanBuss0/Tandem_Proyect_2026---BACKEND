import BaseCrudService from './BaseCrudService.js';
import PertenecienteRepository from '../repositories/PertenecienteRepository.js';
import VinculoService from './VinculoService.js';

class PertenecienteService extends BaseCrudService {
  constructor() {
    super(PertenecienteRepository, { hiddenFields: [] });
  }

  listTutores(idPerteneciente) { return VinculoService.getTutoresByPerteneciente(idPerteneciente); }
  listProfesionales(idPerteneciente) { return VinculoService.getProfesionalesByPerteneciente(idPerteneciente); }
}

export default new PertenecienteService();
