import TipoEventoZonaSeguraService from '../services/TipoEventoZonaSeguraService.js';
import TipoEventoZonaSegura from '../entities/TipoEventoZonaSegura.js';
import BaseCrudController from './base/BaseCrudController.js';

export default new BaseCrudController(new TipoEventoZonaSeguraService(), TipoEventoZonaSegura).router;
