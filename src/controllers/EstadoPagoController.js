import EstadoPagoService from '../services/EstadoPagoService.js';
import EstadoPago from '../entities/EstadoPago.js';
import BaseCrudController from './base/BaseCrudController.js';

export default new BaseCrudController(new EstadoPagoService(), EstadoPago).router;
