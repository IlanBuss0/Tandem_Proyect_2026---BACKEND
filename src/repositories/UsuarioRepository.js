import BaseCrudRepository from './BaseCrudRepository.js';

class UsuarioRepository extends BaseCrudRepository {
  constructor() {
    super('usuarios');
  }
}

export default new UsuarioRepository();
