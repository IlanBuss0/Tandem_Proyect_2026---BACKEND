import TipoMovimientoPuntoService from '../services/TipoMovimientoPuntoService.js';
import TipoMovimientoPunto from '../entities/TipoMovimientoPunto.js';
import BaseCrudController from './base/BaseCrudController.js';

export default new BaseCrudController(new TipoMovimientoPuntoService(), TipoMovimientoPunto).router;
