import HistorialPermisoOtorgadoProfesionalRepository from '../repositories/HistorialPermisoOtorgadoProfesionalRepository.js';
import BaseCrudService from './base/BaseCrudService.js';

export default class HistorialPermisoOtorgadoProfesionalService extends BaseCrudService {
  constructor() {
    super(new HistorialPermisoOtorgadoProfesionalRepository(), 'HistorialPermisoOtorgadoProfesionalRepository');
  }
}
