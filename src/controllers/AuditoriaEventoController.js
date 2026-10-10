import AuditoriaEventoService from '../services/AuditoriaEventoService.js';
import AuditoriaEvento from '../entities/AuditoriaEvento.js';
import BaseCrudController from './base/BaseCrudController.js';

export default new BaseCrudController(new AuditoriaEventoService(), AuditoriaEvento).router;
