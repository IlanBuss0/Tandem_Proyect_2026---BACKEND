import BaseCrudRepository from './BaseCrudRepository.js';
import BD from '../db/BD.js';

class UsuarioRepository extends BaseCrudRepository {
  constructor() {
    super('usuarios', { softDelete: { field: 'activo' } });
  }

  findByEmail(correo) {
    return BD.queryOne('SELECT * FROM usuarios WHERE correo = $1', [correo]);
  }

  findByNombreUsuario(nombreUsuario) {
    return BD.queryOne('SELECT * FROM usuarios WHERE nombre_usuario = $1', [nombreUsuario]);
  }
}

export default new UsuarioRepository();
