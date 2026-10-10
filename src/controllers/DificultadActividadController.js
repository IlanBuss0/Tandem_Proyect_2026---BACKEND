import DificultadActividadService from '../services/DificultadActividadService.js';
import DificultadActividad from '../entities/DificultadActividad.js';
import BaseCrudController from './base/BaseCrudController.js';

export default new BaseCrudController(new DificultadActividadService(), DificultadActividad).router;
