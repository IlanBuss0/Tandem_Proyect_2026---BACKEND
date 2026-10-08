import AlcanceArchivoRepository from '../repositories/AlcanceArchivoRepository.js';
import BaseCrudService from './base/BaseCrudService.js';

export default class AlcanceArchivoService extends BaseCrudService {
  constructor() {
    super(new AlcanceArchivoRepository(), 'AlcanceArchivoRepository');
  }
}
