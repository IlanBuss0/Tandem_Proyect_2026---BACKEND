import BeneficiarioSuscripcionService from '../services/BeneficiarioSuscripcionService.js';
import BeneficiarioSuscripcion from '../entities/BeneficiarioSuscripcion.js';
import BaseCrudController from './base/BaseCrudController.js';

export default new BaseCrudController(new BeneficiarioSuscripcionService(), BeneficiarioSuscripcion).router;
