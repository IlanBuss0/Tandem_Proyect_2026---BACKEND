import BD from '../db/BD.js';

export default class MensajeRepository {
  constructor() {
    console.log('Estoy en: MensajeRepository.constructor()');
  }

  getAllAsync = async () => {
    console.log('MensajeRepository.getAllAsync()');
    const sql = `SELECT id, id_chat, id_usuario_emisor, id_tipo_mensaje, contenido, fecha_envio, eliminado FROM mensajes ORDER BY id DESC`;
    return await BD.query(sql);
  };

  getByIdAsync = async (id) => {
    console.log(`MensajeRepository.getByIdAsync(${id})`);
    const sql = `SELECT id, id_chat, id_usuario_emisor, id_tipo_mensaje, contenido, fecha_envio, eliminado FROM mensajes WHERE id = $1`;
    return await BD.queryOne(sql, [id]);
  };

  getByChatIdAsync = async (idChat, limit = 30, beforeId = null) => {
    console.log(`MensajeRepository.getByChatIdAsync(${idChat}, ${limit}, ${beforeId})`);
    const sql = `
      SELECT id, id_chat, id_usuario_emisor, id_tipo_mensaje, contenido, fecha_envio, eliminado 
      FROM mensajes 
      WHERE id_chat = $1 
        AND ($3::int IS NULL OR id < $3)
        AND eliminado = false
      ORDER BY id DESC 
      LIMIT $2
    `;
    return await BD.query(sql, [idChat, limit, beforeId]);
  };

  getByChatForParticipantAsync = async (idChat, idUsuario, limit = 30, beforeId = null) => {
    console.log(`MensajeRepository.getByChatForParticipantAsync(${idChat}, ${idUsuario}, ${limit}, ${beforeId})`);
    const sql = `
      SELECT m.id, m.id_chat, m.id_usuario_emisor, m.id_tipo_mensaje, m.contenido, m.fecha_envio, m.eliminado
      FROM mensajes m
      INNER JOIN participantes_chats pc ON pc.id_chat = m.id_chat AND pc.id_usuario = $2
      WHERE m.id_chat = $1
        AND ($4::int IS NULL OR m.id < $4)
        AND m.eliminado = false
        AND (pc.oculto_desde IS NULL OR m.fecha_envio >= pc.oculto_desde)
      ORDER BY m.id DESC
      LIMIT $3
    `;
    return await BD.query(sql, [idChat, idUsuario, limit, beforeId]);
  };

  createAsync = async (entity) => {
    console.log(`MensajeRepository.createAsync(${JSON.stringify(entity)})`);
    const sql = `INSERT INTO mensajes (id_chat, id_usuario_emisor, id_tipo_mensaje, contenido, fecha_envio, eliminado) VALUES ($1, $2, $3, $4, $5, COALESCE($6, false)) RETURNING id`;
    const values = [entity?.id_chat, entity?.id_usuario_emisor, entity?.id_tipo_mensaje, entity?.contenido ?? null, entity?.fecha_envio, entity?.eliminado ?? false];
    const result = await BD.queryOne(sql, values);
    return result?.id ?? 0;
  };

  updateAsync = async (entity) => {
    console.log(`MensajeRepository.updateAsync(${JSON.stringify(entity)})`);
    const id = entity.id;
    const previousEntity = await this.getByIdAsync(id);
    if (previousEntity == null) return 0;
    const sql = `UPDATE mensajes SET id_chat = $2, id_usuario_emisor = $3, id_tipo_mensaje = $4, contenido = $5, fecha_envio = $6, eliminado = $7 WHERE id = $1`;
    const values = [id, entity?.id_chat ?? previousEntity.id_chat, entity?.id_usuario_emisor ?? previousEntity.id_usuario_emisor, entity?.id_tipo_mensaje ?? previousEntity.id_tipo_mensaje, entity?.contenido ?? previousEntity.contenido, entity?.fecha_envio ?? previousEntity.fecha_envio, entity?.eliminado ?? previousEntity.eliminado];
    return await BD.execute(sql, values);
  };

  deleteByIdAsync = async (id) => {
    console.log(`MensajeRepository.deleteByIdAsync(${id})`);
    const sql = `UPDATE mensajes SET eliminado = true WHERE id = $1`;
    return await BD.execute(sql, [id]);
  };
}
