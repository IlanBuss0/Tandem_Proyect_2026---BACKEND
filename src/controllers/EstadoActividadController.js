import EstadoActividadService from '../services/EstadoActividadService.js';
import EstadoActividad from '../entities/EstadoActividad.js';
import BaseCrudController from './base/BaseCrudController.js';

export default new BaseCrudController(new EstadoActividadService(), EstadoActividad).router;
