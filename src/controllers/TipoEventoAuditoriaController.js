import TipoEventoAuditoriaService from '../services/TipoEventoAuditoriaService.js';
import TipoEventoAuditoria from '../entities/TipoEventoAuditoria.js';
import BaseCrudController from './base/BaseCrudController.js';

export default new BaseCrudController(new TipoEventoAuditoriaService(), TipoEventoAuditoria).router;
