import PermisoOtorgadoPertenecienteRepository from '../repositories/PermisoOtorgadoPertenecienteRepository.js';
import BaseCrudService from './base/BaseCrudService.js';

export default class PermisoOtorgadoPertenecienteService extends BaseCrudService {
  constructor() {
    super(new PermisoOtorgadoPertenecienteRepository(), 'PermisoOtorgadoPertenecienteRepository');
  }
}
