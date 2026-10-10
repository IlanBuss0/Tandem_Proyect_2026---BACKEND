import EstadoVinculoService from '../services/EstadoVinculoService.js';
import EstadoVinculo from '../entities/EstadoVinculo.js';
import BaseCrudController from './base/BaseCrudController.js';

export default new BaseCrudController(new EstadoVinculoService(), EstadoVinculo).router;
