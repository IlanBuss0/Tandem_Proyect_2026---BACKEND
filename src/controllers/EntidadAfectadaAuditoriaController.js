import EntidadAfectadaAuditoriaService from '../services/EntidadAfectadaAuditoriaService.js';
import EntidadAfectadaAuditoria from '../entities/EntidadAfectadaAuditoria.js';
import BaseCrudController from './base/BaseCrudController.js';

export default new BaseCrudController(new EntidadAfectadaAuditoriaService(), EntidadAfectadaAuditoria).router;
