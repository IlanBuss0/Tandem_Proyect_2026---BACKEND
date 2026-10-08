import PuntoOtorgadoRepository from '../repositories/PuntoOtorgadoRepository.js';
import BaseCrudService from './base/BaseCrudService.js';

export default class PuntoOtorgadoService extends BaseCrudService {
  constructor() {
    super(new PuntoOtorgadoRepository(), 'PuntoOtorgadoRepository');
  }
}
