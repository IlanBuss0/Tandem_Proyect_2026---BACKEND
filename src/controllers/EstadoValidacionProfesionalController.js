import EstadoValidacionProfesionalService from '../services/EstadoValidacionProfesionalService.js';
import EstadoValidacionProfesional from '../entities/EstadoValidacionProfesional.js';
import BaseCrudController from './base/BaseCrudController.js';

export default new BaseCrudController(new EstadoValidacionProfesionalService(), EstadoValidacionProfesional).router;
