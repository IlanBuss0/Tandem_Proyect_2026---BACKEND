import BD from '../db/BD.js';

class AuthRepository {
  findByEmailOrUsername(identifier) {
    return BD.queryOne(
      'SELECT * FROM usuarios WHERE correo = $1 OR nombre_usuario = $1 LIMIT 1',
      [identifier],
    );
  }

  findSafeById(id) {
    return BD.queryOne('SELECT id, id_tipo_usuario, nombre_usuario, nombre, apellido, correo, telefono, fecha_nacimiento, fecha_ingreso, activo FROM usuarios WHERE id = $1', [id]);
  }
}

export default new AuthRepository();
