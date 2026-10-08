import EstadoSuscripcionRepository from '../repositories/EstadoSuscripcionRepository.js';
import BaseCrudService from './base/BaseCrudService.js';

export default class EstadoSuscripcionService extends BaseCrudService {
  constructor() {
    super(new EstadoSuscripcionRepository(), 'EstadoSuscripcionRepository');
  }
}
