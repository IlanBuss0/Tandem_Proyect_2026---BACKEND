import PlanSuscripcionRepository from '../repositories/PlanSuscripcionRepository.js';
import BaseCrudService from './base/BaseCrudService.js';

export default class PlanSuscripcionService extends BaseCrudService {
  constructor() {
    super(new PlanSuscripcionRepository(), 'PlanSuscripcionRepository');
  }
}
