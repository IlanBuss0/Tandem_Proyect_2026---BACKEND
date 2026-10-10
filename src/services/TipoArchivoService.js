import TipoArchivoRepository from '../repositories/TipoArchivoRepository.js';
import BaseCrudService from './base/BaseCrudService.js';

export default class TipoArchivoService extends BaseCrudService {
  constructor() {
    super(new TipoArchivoRepository(), 'TipoArchivoRepository');
  }
}
