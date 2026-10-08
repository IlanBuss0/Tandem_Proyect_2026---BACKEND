import PermisoArchivoService from '../services/PermisoArchivoService.js';
import PermisoArchivo from '../entities/PermisoArchivo.js';
import BaseCrudController from './base/BaseCrudController.js';

export default new BaseCrudController(new PermisoArchivoService(), PermisoArchivo).router;
