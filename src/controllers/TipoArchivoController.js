import TipoArchivoService from '../services/TipoArchivoService.js';
import TipoArchivo from '../entities/TipoArchivo.js';
import BaseCrudController from './base/BaseCrudController.js';

export default new BaseCrudController(new TipoArchivoService(), TipoArchivo).router;
