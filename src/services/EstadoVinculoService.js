import EstadoVinculoRepository from '../repositories/EstadoVinculoRepository.js';
import BaseCrudService from './base/BaseCrudService.js';

export default class EstadoVinculoService extends BaseCrudService {
  constructor() {
    super(new EstadoVinculoRepository(), 'EstadoVinculoRepository');
  }
}
