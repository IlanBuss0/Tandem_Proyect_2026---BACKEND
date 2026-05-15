import BD from '../db/BD.js';

class AuthRepository {
  findByEmailOrUsername(identifier) {
    return BD.queryOne(
      'SELECT * FROM usuarios WHERE email = $1 OR nombre_usuario = $1 LIMIT 1',
      [identifier],
    );
  }

  findSafeById(id) {
    return BD.queryOne('SELECT id, email, nombre_usuario, tipo_usuario, created_at, updated_at FROM usuarios WHERE id = $1', [id]);
  }
}

export default new AuthRepository();
