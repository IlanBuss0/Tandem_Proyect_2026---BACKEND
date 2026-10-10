import TipoMensajeService from '../services/TipoMensajeService.js';
import TipoMensaje from '../entities/TipoMensaje.js';
import BaseCrudController from './base/BaseCrudController.js';

export default new BaseCrudController(new TipoMensajeService(), TipoMensaje).router;
