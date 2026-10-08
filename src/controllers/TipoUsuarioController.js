import TipoUsuarioService from '../services/TipoUsuarioService.js';
import TipoUsuario from '../entities/TipoUsuario.js';
import BaseCrudController from './base/BaseCrudController.js';

export default new BaseCrudController(new TipoUsuarioService(), TipoUsuario).router;
