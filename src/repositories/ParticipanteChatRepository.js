import BD from '../db/BD.js';

export default class ParticipanteChatRepository {
  constructor() {
    console.log('Estoy en: ParticipanteChatRepository.constructor()');
    this.extraColumnsReady = false;
  }

  ensureExtraColumnsAsync = async () => {
    if (this.extraColumnsReady) return;
    await BD.execute(`ALTER TABLE participantes_chats ADD COLUMN IF NOT EXISTS oculto_desde TIMESTAMP`);
    await BD.execute(`ALTER TABLE participantes_chats ADD COLUMN IF NOT EXISTS es_admin BOOLEAN DEFAULT false`);
    this.extraColumnsReady = true;
  };

  getAllAsync = async () => {
    console.log('ParticipanteChatRepository.getAllAsync()');
    await this.ensureExtraColumnsAsync();
    const sql = `SELECT id, id_chat, id_usuario, fecha_ingreso, fecha_salida, ultimo_mensaje_leido_id, fecha_ultima_lectura, oculto_desde, COALESCE(es_admin, false) AS es_admin FROM participantes_chats ORDER BY id DESC`;
    return await BD.query(sql);
  };

  getByIdAsync = async (id) => {
    console.log(`ParticipanteChatRepository.getByIdAsync(${id})`);
    await this.ensureExtraColumnsAsync();
    const sql = `SELECT id, id_chat, id_usuario, fecha_ingreso, fecha_salida, ultimo_mensaje_leido_id, fecha_ultima_lectura, oculto_desde, COALESCE(es_admin, false) AS es_admin FROM participantes_chats WHERE id = $1`;
    return await BD.queryOne(sql, [id]);
  };

  getByChatIdAsync = async (idChat) => {
    console.log(`ParticipanteChatRepository.getByChatIdAsync(${idChat})`);
    await this.ensureExtraColumnsAsync();
    const sql = `SELECT id, id_chat, id_usuario, fecha_ingreso, fecha_salida, ultimo_mensaje_leido_id, fecha_ultima_lectura, oculto_desde, COALESCE(es_admin, false) AS es_admin FROM participantes_chats WHERE id_chat = $1 ORDER BY id DESC`;
    return await BD.query(sql, [idChat]);
  };

  getByChatAndUsuarioAsync = async (idChat, idUsuario) => {
    console.log(`ParticipanteChatRepository.getByChatAndUsuarioAsync(${idChat}, ${idUsuario})`);
    await this.ensureExtraColumnsAsync();
    const sql = `SELECT id, id_chat, id_usuario, fecha_ingreso, fecha_salida, ultimo_mensaje_leido_id, fecha_ultima_lectura, oculto_desde, COALESCE(es_admin, false) AS es_admin FROM participantes_chats WHERE id_chat = $1 AND id_usuario = $2`;
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
    await this.ensureExtraColumnsAsync();
    const sql = `INSERT INTO participantes_chats (id_chat, id_usuario, fecha_ingreso, fecha_salida, oculto_desde, es_admin) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`;
    const values = [entity?.id_chat, entity?.id_usuario, entity?.fecha_ingreso, entity?.fecha_salida ?? null];  
    values.push(entity?.oculto_desde ?? null);
    values.push(Boolean(entity?.es_admin));
    const result = await BD.queryOne(sql, values);
    return result?.id ?? 0;
  };

  updateAsync = async (entity) => {
    console.log(`ParticipanteChatRepository.updateAsync(${JSON.stringify(entity)})`);
    await this.ensureExtraColumnsAsync();
    const id = entity.id;
    const previousEntity = await this.getByIdAsync(id);
    if (previousEntity == null) return 0;
    const sql = `UPDATE participantes_chats SET id_chat = $2, id_usuario = $3, fecha_ingreso = $4, fecha_salida = $5, ultimo_mensaje_leido_id = $6, fecha_ultima_lectura = $7, oculto_desde = $8, es_admin = $9 WHERE id = $1`;
    const values = [id, entity?.id_chat ?? previousEntity.id_chat, entity?.id_usuario ?? previousEntity.id_usuario, entity?.fecha_ingreso ?? previousEntity.fecha_ingreso, entity?.fecha_salida ?? previousEntity.fecha_salida, entity?.ultimo_mensaje_leido_id ?? previousEntity.ultimo_mensaje_leido_id, entity?.fecha_ultima_lectura ?? previousEntity.fecha_ultima_lectura, entity?.oculto_desde === undefined ? previousEntity.oculto_desde : entity.oculto_desde, entity?.es_admin === undefined ? previousEntity.es_admin : Boolean(entity.es_admin)];
    return await BD.execute(sql, values);
  };

  hideForUserAsync = async (idChat, idUsuario) => {
    await this.ensureExtraColumnsAsync();
    const sql = `
      UPDATE participantes_chats
      SET oculto_desde = NOW(), ultimo_mensaje_leido_id = (
        SELECT id FROM mensajes WHERE id_chat = $1 AND eliminado = false ORDER BY id DESC LIMIT 1
      ), fecha_ultima_lectura = NOW()
      WHERE id_chat = $1 AND id_usuario = $2 AND fecha_salida IS NULL
    `;
    return await BD.execute(sql, [idChat, idUsuario]);
  };

  leaveForUserAsync = async (idChat, idUsuario) => {
    await this.ensureExtraColumnsAsync();
    const sql = `
      UPDATE participantes_chats
      SET fecha_salida = NOW(), es_admin = false
      WHERE id_chat = $1 AND id_usuario = $2 AND fecha_salida IS NULL
    `;
    return await BD.execute(sql, [idChat, idUsuario]);
  };

  deleteByIdAsync = async (id) => {
    console.log(`ParticipanteChatRepository.deleteByIdAsync(${id})`);
    const sql = `DELETE FROM participantes_chats WHERE id = $1`;
    return await BD.execute(sql, [id]);
  };
}
