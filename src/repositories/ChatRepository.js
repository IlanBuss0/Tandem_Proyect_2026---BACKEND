import BD from '../db/BD.js';

export default class ChatRepository {
  constructor() {
    console.log('Estoy en: ChatRepository.constructor()');
  }

  getAllAsync = async () => {
    console.log('ChatRepository.getAllAsync()');
    const sql = `SELECT id, id_tipo_chat, nombre, fecha_creacion, activo FROM "Chats" ORDER BY id DESC`;
    return await BD.query(sql);
  };

  getByIdAsync = async (id) => {
    console.log(`ChatRepository.getByIdAsync(${id})`);
    const sql = `SELECT id, id_tipo_chat, nombre, fecha_creacion, activo FROM "Chats" WHERE id = $1`;
    return await BD.queryOne(sql, [id]);
  };

  createAsync = async (entity) => {
    console.log(`ChatRepository.createAsync(${JSON.stringify(entity)})`);
    const sql = `INSERT INTO "Chats" (id_tipo_chat, nombre, fecha_creacion, activo) VALUES ($1, $2, $3, COALESCE($4, true)) RETURNING id`;
    const values = [entity?.id_tipo_chat, entity?.nombre ?? null, entity?.fecha_creacion, entity?.activo ?? true];
    const result = await BD.queryOne(sql, values);
    return result?.id ?? 0;
  };

  updateAsync = async (entity) => {
    console.log(`ChatRepository.updateAsync(${JSON.stringify(entity)})`);
    const id = entity.id;
    const previousEntity = await this.getByIdAsync(id);
    if (previousEntity == null) return 0;
    const sql = `UPDATE "Chats" SET id_tipo_chat = $2, nombre = $3, fecha_creacion = $4, activo = $5 WHERE id = $1`;
    const values = [id, entity?.id_tipo_chat ?? previousEntity.id_tipo_chat, entity?.nombre ?? previousEntity.nombre, entity?.fecha_creacion ?? previousEntity.fecha_creacion, entity?.activo ?? previousEntity.activo];
    return await BD.execute(sql, values);
  };

  deleteByIdAsync = async (id) => {
    console.log(`ChatRepository.deleteByIdAsync(${id})`);
    const sql = `UPDATE "Chats" SET activo = false WHERE id = $1`;
    return await BD.execute(sql, [id]);
  };
}
