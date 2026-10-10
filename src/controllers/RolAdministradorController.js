import RolAdministradorService from '../services/RolAdministradorService.js';
import RolAdministrador from '../entities/RolAdministrador.js';
import BaseCrudController from './base/BaseCrudController.js';

export default new BaseCrudController(new RolAdministradorService(), RolAdministrador).router;
