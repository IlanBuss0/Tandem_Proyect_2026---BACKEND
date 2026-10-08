import PermisoArchivoRepository from '../repositories/PermisoArchivoRepository.js';
import BaseCrudService from './base/BaseCrudService.js';

export default class PermisoArchivoService extends BaseCrudService {
  constructor() {
    super(new PermisoArchivoRepository(), 'PermisoArchivoRepository');
  }
}
