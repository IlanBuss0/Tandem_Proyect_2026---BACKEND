import TipoMensajeRepository from '../repositories/TipoMensajeRepository.js';
import BaseCrudService from './base/BaseCrudService.js';

export default class TipoMensajeService extends BaseCrudService {
  constructor() {
    super(new TipoMensajeRepository(), 'TipoMensajeRepository');
  }
}
