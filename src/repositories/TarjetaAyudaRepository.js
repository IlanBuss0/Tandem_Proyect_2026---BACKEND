import BD from '../db/BD.js';

export default class TarjetaAyudaRepository {
  async ensureSchemaAsync() {
    await BD.execute(`
      CREATE TABLE IF NOT EXISTS tarjetas_ayuda (
        id_perteneciente INTEGER PRIMARY KEY REFERENCES pertenecientes(id) ON DELETE CASCADE,
        activa BOOLEAN NOT NULL DEFAULT false,
        token VARCHAR(64) NOT NULL UNIQUE,
        mostrar_celular BOOLEAN NOT NULL DEFAULT true,
        mostrar_mail BOOLEAN NOT NULL DEFAULT false,
        mostrar_domicilio BOOLEAN NOT NULL DEFAULT false,
        domicilio TEXT,
        mensaje TEXT,
        id_usuario_modificador INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
        fecha_modificacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
  }

  async getByPertenecienteIdAsync(idPerteneciente) {
    return await BD.queryOne(
      `SELECT id_perteneciente, activa, token, mostrar_celular, mostrar_mail, mostrar_domicilio,
              domicilio, mensaje, fecha_modificacion
       FROM tarjetas_ayuda WHERE id_perteneciente = $1`,
      [idPerteneciente],
    );
  }

  // Idempotente: si dos pedidos crean a la vez, gana el primero.
  async createIfMissingAsync(idPerteneciente, token, idUsuarioModificador) {
    await BD.execute(
      `INSERT INTO tarjetas_ayuda (id_perteneciente, token, id_usuario_modificador)
       VALUES ($1, $2, $3)
       ON CONFLICT (id_perteneciente) DO NOTHING`,
      [idPerteneciente, token, idUsuarioModificador],
    );
  }

  async updateAsync(idPerteneciente, data, idUsuarioModificador) {
    return await BD.execute(
      `UPDATE tarjetas_ayuda
       SET activa = $2, mostrar_celular = $3, mostrar_mail = $4, mostrar_domicilio = $5,
           domicilio = $6, mensaje = $7, id_usuario_modificador = $8, fecha_modificacion = NOW()
       WHERE id_perteneciente = $1`,
      [
        idPerteneciente, data.activa, data.mostrarCelular, data.mostrarMail,
        data.mostrarDomicilio, data.domicilio, data.mensaje, idUsuarioModificador,
      ],
    );
  }

  async updateTokenAsync(idPerteneciente, token, idUsuarioModificador) {
    return await BD.execute(
      `UPDATE tarjetas_ayuda
       SET token = $2, id_usuario_modificador = $3, fecha_modificacion = NOW()
       WHERE id_perteneciente = $1`,
      [idPerteneciente, token, idUsuarioModificador],
    );
  }

  // Solo devuelve tarjetas activas de una persona con cuenta activa: apagada,
  // inexistente y token viejo son indistinguibles para quien llama.
  async getActiveByTokenAsync(token) {
    return await BD.queryOne(
      `SELECT ta.id_perteneciente, p.id_usuario, u.nombre, u.apellido,
              ta.mostrar_celular, ta.mostrar_mail, ta.mostrar_domicilio, ta.domicilio, ta.mensaje
       FROM tarjetas_ayuda ta
       INNER JOIN pertenecientes p ON p.id = ta.id_perteneciente
       INNER JOIN usuarios u ON u.id = p.id_usuario
       WHERE ta.token = $1 AND ta.activa = true AND u.activo = true`,
      [token],
    );
  }

  async getPertenecienteNombreAsync(idPerteneciente) {
    return await BD.queryOne(
      `SELECT p.id AS id_perteneciente, p.id_usuario, u.nombre, u.apellido
       FROM pertenecientes p
       INNER JOIN usuarios u ON u.id = p.id_usuario
       WHERE p.id = $1`,
      [idPerteneciente],
    );
  }
}
