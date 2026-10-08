import TipoEventoAuditoriaRepository from '../repositories/TipoEventoAuditoriaRepository.js';
import BaseCrudService from './base/BaseCrudService.js';

export default class TipoEventoAuditoriaService extends BaseCrudService {
  constructor() {
    super(new TipoEventoAuditoriaRepository(), 'TipoEventoAuditoriaRepository');
  }
}
