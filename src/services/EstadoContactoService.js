import EstadoContactoRepository from '../repositories/EstadoContactoRepository.js';
import BaseCrudService from './base/BaseCrudService.js';

export default class EstadoContactoService extends BaseCrudService {
  constructor() {
    super(new EstadoContactoRepository(), 'EstadoContactoRepository');
  }
}
