import AutonomiaOperativaRepository from '../repositories/AutonomiaOperativaRepository.js';
import BaseCrudService from './base/BaseCrudService.js';

export default class AutonomiaOperativaService extends BaseCrudService {
  constructor() {
    super(new AutonomiaOperativaRepository(), 'AutonomiaOperativaRepository');
  }
}
