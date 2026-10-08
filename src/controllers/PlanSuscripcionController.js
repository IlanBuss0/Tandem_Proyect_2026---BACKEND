import PlanSuscripcionService from '../services/PlanSuscripcionService.js';
import PlanSuscripcion from '../entities/PlanSuscripcion.js';
import BaseCrudController from './base/BaseCrudController.js';

export default new BaseCrudController(new PlanSuscripcionService(), PlanSuscripcion).router;
