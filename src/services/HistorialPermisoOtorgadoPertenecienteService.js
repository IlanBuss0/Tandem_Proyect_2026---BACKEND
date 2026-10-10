import HistorialPermisoOtorgadoPertenecienteRepository from '../repositories/HistorialPermisoOtorgadoPertenecienteRepository.js';
import BaseCrudService from './base/BaseCrudService.js';

export default class HistorialPermisoOtorgadoPertenecienteService extends BaseCrudService {
  constructor() {
    super(new HistorialPermisoOtorgadoPertenecienteRepository(), 'HistorialPermisoOtorgadoPertenecienteRepository');
  }
}
