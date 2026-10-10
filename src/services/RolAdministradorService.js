import RolAdministradorRepository from '../repositories/RolAdministradorRepository.js';
import BaseCrudService from './base/BaseCrudService.js';

export default class RolAdministradorService extends BaseCrudService {
  constructor() {
    super(new RolAdministradorRepository(), 'RolAdministradorRepository');
  }
}
