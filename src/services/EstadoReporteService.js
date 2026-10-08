import EstadoReporteRepository from '../repositories/EstadoReporteRepository.js';
import BaseCrudService from './base/BaseCrudService.js';

export default class EstadoReporteService extends BaseCrudService {
  constructor() {
    super(new EstadoReporteRepository(), 'EstadoReporteRepository');
  }
}
