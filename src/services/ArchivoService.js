import ArchivoRepository from '../repositories/ArchivoRepository.js';
import BaseCrudService from './base/BaseCrudService.js';

export default class ArchivoService extends BaseCrudService {
  constructor() {
    super(new ArchivoRepository(), 'ArchivoRepository');
  }
}
