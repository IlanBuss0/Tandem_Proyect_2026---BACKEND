import TipoNotificacionRepository from '../repositories/TipoNotificacionRepository.js';
import BaseCrudService from './base/BaseCrudService.js';

export default class TipoNotificacionService extends BaseCrudService {
  constructor() {
    super(new TipoNotificacionRepository(), 'TipoNotificacionRepository');
  }
}
