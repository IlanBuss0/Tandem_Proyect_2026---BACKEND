import TipoPermisoArchivoRepository from '../repositories/TipoPermisoArchivoRepository.js';
import BaseCrudService from './base/BaseCrudService.js';

export default class TipoPermisoArchivoService extends BaseCrudService {
  constructor() {
    super(new TipoPermisoArchivoRepository(), 'TipoPermisoArchivoRepository');
  }
}
