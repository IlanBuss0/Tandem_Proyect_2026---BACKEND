import TipoActividadRepository from '../repositories/TipoActividadRepository.js';
import BaseCrudService from './base/BaseCrudService.js';

export default class TipoActividadService extends BaseCrudService {
  constructor() {
    super(new TipoActividadRepository(), 'TipoActividadRepository');
  }
}
