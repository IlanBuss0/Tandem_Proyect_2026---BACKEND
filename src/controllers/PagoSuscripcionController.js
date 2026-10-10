import PagoSuscripcionService from '../services/PagoSuscripcionService.js';
import PagoSuscripcion from '../entities/PagoSuscripcion.js';
import BaseCrudController from './base/BaseCrudController.js';

export default new BaseCrudController(new PagoSuscripcionService(), PagoSuscripcion).router;
