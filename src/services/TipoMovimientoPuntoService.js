import TipoMovimientoPuntoRepository from '../repositories/TipoMovimientoPuntoRepository.js';
import BaseCrudService from './base/BaseCrudService.js';

export default class TipoMovimientoPuntoService extends BaseCrudService {
  constructor() {
    super(new TipoMovimientoPuntoRepository(), 'TipoMovimientoPuntoRepository');
  }
}
