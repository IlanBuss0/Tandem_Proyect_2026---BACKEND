import BD from '../db/BD.js';

export default class TipoChatRepository {
  constructor() {
    console.log('Estoy en: TipoChatRepository.constructor()');
  }

  getAllAsync = async () => {
    console.log('TipoChatRepository.getAllAsync()');
    const sql = `SELECT id, nombre, orden FROM tipos_chats ORDER BY id DESC`;
    return await BD.query(sql);
  };

  getByIdAsync = async (id) => {
    console.log(`TipoChatRepository.getByIdAsync(${id})`);
    const sql = `SELECT id, nombre, orden FROM tipos_chats WHERE id = $1`;
    return await BD.queryOne(sql, [id]);
  };

  getByNombreAsync = async (nombre) => {
    console.log(`TipoChatRepository.getByNombreAsync(${nombre})`);
    const sql = `SELECT id, nombre, orden FROM tipos_chats WHERE LOWER(nombre) = LOWER($1)`;
    return await BD.queryOne(sql, [nombre]);
  };

  createAsync = async (entity) => {
    console.log(`TipoChatRepository.createAsync(${JSON.stringify(entity)})`);
    const sql = `INSERT INTO tipos_chats (nombre, orden) VALUES ($1, $2) RETURNING id`;
    const values = [entity?.nombre ?? null, entity?.orden ?? null];
    const result = await BD.queryOne(sql, values);
    return result?.id ?? 0;
  };

  updateAsync = async (entity) => {
    console.log(`TipoChatRepository.updateAsync(${JSON.stringify(entity)})`);
    const id = entity.id;
    const previousEntity = await this.getByIdAsync(id);
    if (previousEntity == null) return 0;
    const sql = `UPDATE tipos_chats SET nombre = $2, orden = $3 WHERE id = $1`;
    const values = [id, entity?.nombre ?? previousEntity.nombre, entity?.orden ?? previousEntity.orden];
    return await BD.execute(sql, values);
  };

  deleteByIdAsync = async (id) => {
    console.log(`TipoChatRepository.deleteByIdAsync(${id})`);
    const sql = `DELETE FROM tipos_chats WHERE id = $1`;
    return await BD.execute(sql, [id]);
  };
}
