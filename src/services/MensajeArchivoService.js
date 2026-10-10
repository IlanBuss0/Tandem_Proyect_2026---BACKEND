import MensajeArchivoRepository from '../repositories/MensajeArchivoRepository.js';
import BaseCrudService from './base/BaseCrudService.js';

export default class MensajeArchivoService extends BaseCrudService {
  constructor() {
    super(new MensajeArchivoRepository(), 'MensajeArchivoRepository');
  }
}
