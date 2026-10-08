import EstadoReporteService from '../services/EstadoReporteService.js';
import EstadoReporte from '../entities/EstadoReporte.js';
import BaseCrudController from './base/BaseCrudController.js';

export default new BaseCrudController(new EstadoReporteService(), EstadoReporte).router;
