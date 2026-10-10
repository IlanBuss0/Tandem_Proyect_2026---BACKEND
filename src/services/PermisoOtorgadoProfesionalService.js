import PermisoOtorgadoProfesionalRepository from '../repositories/PermisoOtorgadoProfesionalRepository.js';
import BaseCrudService from './base/BaseCrudService.js';

export default class PermisoOtorgadoProfesionalService extends BaseCrudService {
  constructor() {
    super(new PermisoOtorgadoProfesionalRepository(), 'PermisoOtorgadoProfesionalRepository');
  }
}
