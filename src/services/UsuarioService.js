import BaseCrudService from './BaseCrudService.js';
import UsuarioRepository from '../repositories/UsuarioRepository.js';

class UsuarioService extends BaseCrudService {
  constructor() {
    super(UsuarioRepository, { hiddenFields: ['password_hash','password'] });
  }
}

export default new UsuarioService();
