import PaquetePuntoRepository from '../repositories/PaquetePuntoRepository.js';
import BaseCrudService from './base/BaseCrudService.js';

export default class PaquetePuntoService extends BaseCrudService {
  constructor() {
    super(new PaquetePuntoRepository(), 'PaquetePuntoRepository');
  }
}
