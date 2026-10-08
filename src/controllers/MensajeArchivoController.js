import MensajeArchivoService from '../services/MensajeArchivoService.js';
import MensajeArchivo from '../entities/MensajeArchivo.js';
import BaseCrudController from './base/BaseCrudController.js';

export default new BaseCrudController(new MensajeArchivoService(), MensajeArchivo).router;
