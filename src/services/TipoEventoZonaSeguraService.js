import TipoEventoZonaSeguraRepository from '../repositories/TipoEventoZonaSeguraRepository.js';
import BaseCrudService from './base/BaseCrudService.js';

export default class TipoEventoZonaSeguraService extends BaseCrudService {
  constructor() {
    super(new TipoEventoZonaSeguraRepository(), 'TipoEventoZonaSeguraRepository');
  }
}
