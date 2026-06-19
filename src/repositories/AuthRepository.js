import BD from '../db/BD.js';

class AuthRepository {
  findByCorreoOrNombreUsuario(identificador) {
    return BD.queryOne(
      `
        SELECT
          id,
          id_tipo_usuario,
          nombre_usuario,
          contrasena_hash,
          nombre,
          apellido,
          correo,
          telefono,
          fecha_nacimiento,
          fecha_ingreso,
          activo
        FROM usuarios
        WHERE LOWER(correo) = LOWER($1) OR LOWER(nombre_usuario) = LOWER($1)
        LIMIT 1
      `,
      [identificador],
    );
  }

  findSafeById(id) {
    return BD.queryOne('SELECT id, id_tipo_usuario, nombre_usuario, nombre, apellido, correo, telefono, fecha_nacimiento, fecha_ingreso, activo FROM usuarios WHERE id = $1', [id]);
  }

  updatePasswordHash(id, contrasenaHash) {
    return BD.execute('UPDATE usuarios SET contrasena_hash = $2 WHERE id = $1', [id, contrasenaHash]);
  }
}

export default new AuthRepository();
