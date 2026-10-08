import TipoActividadService from '../services/TipoActividadService.js';
import TipoActividad from '../entities/TipoActividad.js';
import BaseCrudController from './base/BaseCrudController.js';

export default new BaseCrudController(new TipoActividadService(), TipoActividad).router;
