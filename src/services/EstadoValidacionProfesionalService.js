import EstadoValidacionProfesionalRepository from '../repositories/EstadoValidacionProfesionalRepository.js';
import BaseCrudService from './base/BaseCrudService.js';

export default class EstadoValidacionProfesionalService extends BaseCrudService {
  constructor() {
    super(new EstadoValidacionProfesionalRepository(), 'EstadoValidacionProfesionalRepository');
  }
}
