import CatalogoPermisoPertenecienteService from '../services/CatalogoPermisoPertenecienteService.js';
import CatalogoPermisoPerteneciente from '../entities/CatalogoPermisoPerteneciente.js';
import BaseCrudController from './base/BaseCrudController.js';

export default new BaseCrudController(new CatalogoPermisoPertenecienteService(), CatalogoPermisoPerteneciente).router;
