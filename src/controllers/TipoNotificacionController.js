import TipoNotificacionService from '../services/TipoNotificacionService.js';
import TipoNotificacion from '../entities/TipoNotificacion.js';
import BaseCrudController from './base/BaseCrudController.js';

export default new BaseCrudController(new TipoNotificacionService(), TipoNotificacion).router;
