import EstadoPagoRepository from '../repositories/EstadoPagoRepository.js';
import BaseCrudService from './base/BaseCrudService.js';

export default class EstadoPagoService extends BaseCrudService {
  constructor() {
    super(new EstadoPagoRepository(), 'EstadoPagoRepository');
  }
}
