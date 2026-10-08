import BeneficiarioSuscripcionRepository from '../repositories/BeneficiarioSuscripcionRepository.js';
import BaseCrudService from './base/BaseCrudService.js';

export default class BeneficiarioSuscripcionService extends BaseCrudService {
  constructor() {
    super(new BeneficiarioSuscripcionRepository(), 'BeneficiarioSuscripcionRepository');
  }
}
