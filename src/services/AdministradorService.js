import BaseCrudService from './BaseCrudService.js';
import AdministradorRepository from '../repositories/AdministradorRepository.js';

class AdministradorService extends BaseCrudService {
  constructor() {
    super(AdministradorRepository, { hiddenFields: ['password_hash','password'] });
  }
}

export default new AdministradorService();
