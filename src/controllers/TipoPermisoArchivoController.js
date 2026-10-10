import TipoPermisoArchivoService from '../services/TipoPermisoArchivoService.js';
import TipoPermisoArchivo from '../entities/TipoPermisoArchivo.js';
import BaseCrudController from './base/BaseCrudController.js';

export default new BaseCrudController(new TipoPermisoArchivoService(), TipoPermisoArchivo).router;
