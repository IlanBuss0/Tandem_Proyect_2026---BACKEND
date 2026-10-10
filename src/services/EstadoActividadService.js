import EstadoActividadRepository from '../repositories/EstadoActividadRepository.js';
import BaseCrudService from './base/BaseCrudService.js';

export default class EstadoActividadService extends BaseCrudService {
  constructor() {
    super(new EstadoActividadRepository(), 'EstadoActividadRepository');
  }
}
