import PagoSuscripcionRepository from '../repositories/PagoSuscripcionRepository.js';
import BaseCrudService from './base/BaseCrudService.js';

export default class PagoSuscripcionService extends BaseCrudService {
  constructor() {
    super(new PagoSuscripcionRepository(), 'PagoSuscripcionRepository');
  }
}
