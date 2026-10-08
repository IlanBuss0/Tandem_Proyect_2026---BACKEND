import EntidadAfectadaAuditoriaRepository from '../repositories/EntidadAfectadaAuditoriaRepository.js';
import BaseCrudService from './base/BaseCrudService.js';

export default class EntidadAfectadaAuditoriaService extends BaseCrudService {
  constructor() {
    super(new EntidadAfectadaAuditoriaRepository(), 'EntidadAfectadaAuditoriaRepository');
  }
}
