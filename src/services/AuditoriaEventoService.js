import AuditoriaEventoRepository from '../repositories/AuditoriaEventoRepository.js';
import BaseCrudService from './base/BaseCrudService.js';

export default class AuditoriaEventoService extends BaseCrudService {
  constructor() {
    super(new AuditoriaEventoRepository(), 'AuditoriaEventoRepository');
  }
}
