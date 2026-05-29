import BD from '../db/BD.js';

export default class ChatRepository {
  constructor() {
    console.log('Estoy en: ChatRepository.constructor()');
  }

  getAllAsync = async () => {
    console.log('ChatRepository.getAllAsync()');
    const sql = `SELECT id, id_tipo_chat, nombre, fecha_creacion, activo FROM chats ORDER BY id DESC`;
    return await BD.query(sql);
  };

  getByIdAsync = async (id) => {
    console.log(`ChatRepository.getByIdAsync(${id})`);
    const sql = `SELECT id, id_tipo_chat, nombre, fecha_creacion, activo FROM chats WHERE id = $1`;
    return await BD.queryOne(sql, [id]);
  };

  getByUsuarioIdAsync = async (idUsuario) => {
    console.log(`ChatRepository.getByUsuarioIdAsync(${idUsuario})`);
    const sql = `
      SELECT 
        c.id, 
        c.id_tipo_chat, 
        c.nombre, 
        c.fecha_creacion, 
        c.activo,
        u_otro.id AS id_otro_usuario,
        u_otro.nombre AS nombre_otro_usuario,
        u_otro.apellido AS apellido_otro_usuario,
        m.contenido AS ultimo_mensaje_contenido,
        m.fecha_envio AS ultimo_mensaje_fecha,
        m.id_usuario_emisor AS ultimo_mensaje_id_emisor,
        (
          SELECT COUNT(*)::int
          FROM mensajes m2 
          WHERE m2.id_chat = c.id 
            AND m2.id > COALESCE(pc.ultimo_mensaje_leido_id, 0)
            AND m2.id_usuario_emisor != $1
            AND m2.eliminado = false
        ) AS cantidad_no_leidos
      FROM chats c
      INNER JOIN participantes_chats pc ON pc.id_chat = c.id
      LEFT JOIN participantes_chats pc_otro ON pc_otro.id_chat = c.id AND pc_otro.id_usuario != $1
      LEFT JOIN usuarios u_otro ON u_otro.id = pc_otro.id_usuario
      LEFT JOIN LATERAL (
          SELECT contenido, fecha_envio, id_usuario_emisor
          FROM mensajes 
          WHERE id_chat = c.id AND eliminado = false
          ORDER BY fecha_envio DESC
          LIMIT 1
      ) m ON true
      WHERE pc.id_usuario = $1
        AND pc.fecha_salida IS NULL
        AND c.activo = true
      ORDER BY m.fecha_envio DESC NULLS LAST, c.fecha_creacion DESC
    `;
    return await BD.query(sql, [idUsuario]);
  };

  getActiveBetweenUsersAsync = async (idUsuarioA, idUsuarioB, idTipoChat = null) => {
    console.log(`ChatRepository.getActiveBetweenUsersAsync(${idUsuarioA}, ${idUsuarioB}, ${idTipoChat})`);
    const sql = `
      SELECT c.id, c.id_tipo_chat, c.nombre, c.fecha_creacion, c.activo
      FROM chats c
      INNER JOIN participantes_chats pca ON pca.id_chat = c.id
      INNER JOIN participantes_chats pcb ON pcb.id_chat = c.id
      WHERE pca.id_usuario = $1
        AND pcb.id_usuario = $2
        AND pca.fecha_salida IS NULL
        AND pcb.fecha_salida IS NULL
        AND c.activo = true
        AND ($3::int IS NULL OR c.id_tipo_chat = $3)
      ORDER BY c.fecha_creacion DESC
      LIMIT 1
    `;
    return await BD.queryOne(sql, [idUsuarioA, idUsuarioB, idTipoChat]);
  };

  createWithParticipantsAsync = async ({ id_tipo_chat, nombre, fecha_creacion, participantes }) => {
    return await BD.transaction(async (client) => {
      const chatResult = await client.query(
        `INSERT INTO chats (id_tipo_chat, nombre, fecha_creacion, activo) VALUES ($1, $2, $3, true) RETURNING id, id_tipo_chat, nombre, fecha_creacion, activo`,
        [id_tipo_chat, nombre ?? null, fecha_creacion],
      );

      const chat = chatResult.rows[0];

      for (const idUsuario of participantes) {
        await client.query(
          `INSERT INTO participantes_chats (id_chat, id_usuario, fecha_ingreso, fecha_salida) VALUES ($1, $2, $3, null)`,
          [chat.id, idUsuario, fecha_creacion],
        );
      }

      return chat;
    });
  };

  createAsync = async (entity) => {
    const sql = `INSERT INTO chats (id_tipo_chat, nombre, fecha_creacion, activo) VALUES ($1, $2, $3, COALESCE($4, true)) RETURNING id`;
    const values = [entity?.id_tipo_chat, entity?.nombre ?? null, entity?.fecha_creacion, entity?.activo ?? true];
    const result = await BD.queryOne(sql, values);
    return result?.id ?? 0;
  };

  updateAsync = async (entity) => {
    const id = entity.id;
    const previousEntity = await this.getByIdAsync(id);
    if (previousEntity == null) return 0;
    const sql = `UPDATE chats SET id_tipo_chat = $2, nombre = $3, fecha_creacion = $4, activo = $5 WHERE id = $1`;
    const values = [id, entity?.id_tipo_chat ?? previousEntity.id_tipo_chat, entity?.nombre ?? previousEntity.nombre, entity?.fecha_creacion ?? previousEntity.fecha_creacion, entity?.activo ?? previousEntity.activo];
    return await BD.execute(sql, values);
  };

  deleteByIdAsync = async (id) => {
    const sql = `UPDATE chats SET activo = false WHERE id = $1`;
    return await BD.execute(sql, [id]);
  };
}
