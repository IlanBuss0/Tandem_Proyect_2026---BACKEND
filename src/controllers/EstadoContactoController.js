import EstadoContactoService from '../services/EstadoContactoService.js';
import EstadoContacto from '../entities/EstadoContacto.js';
import BaseCrudController from './base/BaseCrudController.js';

export default new BaseCrudController(new EstadoContactoService(), EstadoContacto).router;
