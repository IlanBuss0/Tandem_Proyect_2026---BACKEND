import BaseCrudRepository from './BaseCrudRepository.js';
import BD from '../db/BD.js';

class UsuarioRepository extends BaseCrudRepository {
  constructor() {
    super('usuarios');
  }

  findByEmail(email) {
    return BD.queryOne('SELECT * FROM usuarios WHERE email = $1', [email]);
  }

  findByNombreUsuario(nombreUsuario) {
    return BD.queryOne('SELECT * FROM usuarios WHERE nombre_usuario = $1', [nombreUsuario]);
  }
}

export default new UsuarioRepository();
