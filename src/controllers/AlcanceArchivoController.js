import AlcanceArchivoService from '../services/AlcanceArchivoService.js';
import AlcanceArchivo from '../entities/AlcanceArchivo.js';
import BaseCrudController from './base/BaseCrudController.js';

export default new BaseCrudController(new AlcanceArchivoService(), AlcanceArchivo).router;
