import EstadoSuscripcionService from '../services/EstadoSuscripcionService.js';
import EstadoSuscripcion from '../entities/EstadoSuscripcion.js';
import BaseCrudController from './base/BaseCrudController.js';

export default new BaseCrudController(new EstadoSuscripcionService(), EstadoSuscripcion).router;
