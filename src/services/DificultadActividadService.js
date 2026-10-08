import DificultadActividadRepository from '../repositories/DificultadActividadRepository.js';
import BaseCrudService from './base/BaseCrudService.js';

export default class DificultadActividadService extends BaseCrudService {
  constructor() {
    super(new DificultadActividadRepository(), 'DificultadActividadRepository');
  }
}
