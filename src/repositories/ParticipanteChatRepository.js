import BD from '../db/BD.js';

export default class ParticipanteChatRepository {
  constructor() {
    console.log('Estoy en: ParticipanteChatRepository.constructor()');
  }

  getAllAsync = async () => {
    console.log('ParticipanteChatRepository.getAllAsync()');
    const sql = `SELECT id, id_chat, id_usuario, fecha_ingreso, fecha_salida, ultimo_mensaje_leido_id, fecha_ultima_lectura FROM participantes_chats ORDER BY id DESC`;
    return await BD.query(sql);
  };

  getByIdAsync = async (id) => {
    console.log(`ParticipanteChatRepository.getByIdAsync(${id})`);
    const sql = `SELECT id, id_chat, id_usuario, fecha_ingreso, fecha_salida, ultimo_mensaje_leido_id, fecha_ultima_lectura FROM participantes_chats WHERE id = $1`;
    return await BD.queryOne(sql, [id]);
  };

  getByChatIdAsync = async (idChat) => {
    console.log(`ParticipanteChatRepository.getByChatIdAsync(${idChat})`);
    const sql = `SELECT id, id_chat, id_usuario, fecha_ingreso, fecha_salida, ultimo_mensaje_leido_id, fecha_ultima_lectura FROM participantes_chats WHERE id_chat = $1 ORDER BY id DESC`;
    return await BD.query(sql, [idChat]);
  };

  getByChatAndUsuarioAsync = async (idChat, idUsuario) => {
    console.log(`ParticipanteChatRepository.getByChatAndUsuarioAsync(${idChat}, ${idUsuario})`);
    const sql = `SELECT id, id_chat, id_usuario, fecha_ingreso, fecha_salida, ultimo_mensaje_leido_id, fecha_ultima_lectura FROM participantes_chats WHERE id_chat = $1 AND id_usuario = $2`;
    return await BD.queryOne(sql, [idChat, idUsuario]);
  };

  marcarComoLeidoAsync = async (idChat, idUsuario, idMensaje) => {
    console.log(`ParticipanteChatRepository.marcarComoLeidoAsync(${idChat}, ${idUsuario}, ${idMensaje})`);
    const sql = `
      UPDATE participantes_chats 
      SET ultimo_mensaje_leido_id = $3, 
          fecha_ultima_lectura = NOW() 
      WHERE id_chat = $1 AND id_usuario = $2
    `;
    return await BD.execute(sql, [idChat, idUsuario, idMensaje]);
  };

  createAsync = async (entity) => {
    console.log(`ParticipanteChatRepository.createAsync(${JSON.stringify(entity)})`);
    const sql = `INSERT INTO participantes_chats (id_chat, id_usuario, fecha_ingreso, fecha_salida) VALUES ($1, $2, $3, $4) RETURNING id`;
    const values = [entity?.id_chat, entity?.id_usuario, entity?.fecha_ingreso, entity?.fecha_salida ?? null];  
    const result = await BD.queryOne(sql, values);
    return result?.id ?? 0;
  };

  updateAsync = async (entity) => {
    console.log(`ParticipanteChatRepository.updateAsync(${JSON.stringify(entity)})`);
    const id = entity.id;
    const previousEntity = await this.getByIdAsync(id);
    if (previousEntity == null) return 0;
    const sql = `UPDATE participantes_chats SET id_chat = $2, id_usuario = $3, fecha_ingreso = $4, fecha_salida = $5, ultimo_mensaje_leido_id = $6, fecha_ultima_lectura = $7 WHERE id = $1`;
    const values = [id, entity?.id_chat ?? previousEntity.id_chat, entity?.id_usuario ?? previousEntity.id_usuario, entity?.fecha_ingreso ?? previousEntity.fecha_ingreso, entity?.fecha_salida ?? previousEntity.fecha_salida, entity?.ultimo_mensaje_leido_id ?? previousEntity.ultimo_mensaje_leido_id, entity?.fecha_ultima_lectura ?? previousEntity.fecha_ultima_lectura];
    return await BD.execute(sql, values);
  };

  deleteByIdAsync = async (id) => {
    console.log(`ParticipanteChatRepository.deleteByIdAsync(${id})`);
    const sql = `DELETE FROM participantes_chats WHERE id = $1`;
    return await BD.execute(sql, [id]);
  };
}
