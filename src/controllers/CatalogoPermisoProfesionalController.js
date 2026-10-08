import CatalogoPermisoProfesionalService from '../services/CatalogoPermisoProfesionalService.js';
import CatalogoPermisoProfesional from '../entities/CatalogoPermisoProfesional.js';
import BaseCrudController from './base/BaseCrudController.js';

export default new BaseCrudController(new CatalogoPermisoProfesionalService(), CatalogoPermisoProfesional).router;
