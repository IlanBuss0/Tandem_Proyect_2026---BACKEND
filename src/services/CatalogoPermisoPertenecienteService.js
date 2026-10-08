import CatalogoPermisoPertenecienteRepository from '../repositories/CatalogoPermisoPertenecienteRepository.js';
import BaseCrudService from './base/BaseCrudService.js';

export default class CatalogoPermisoPertenecienteService extends BaseCrudService {
  constructor() {
    super(new CatalogoPermisoPertenecienteRepository(), 'CatalogoPermisoPertenecienteRepository');
  }
}
