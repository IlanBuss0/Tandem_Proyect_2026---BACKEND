import BD from '../db/BD.js';

export default class InventarioAvatarRepository {
  constructor() {
    console.log('Estoy en: InventarioAvatarRepository.constructor()');
  }

  getAllAsync = async () => {
    console.log('InventarioAvatarRepository.getAllAsync()');
    const sql = `SELECT id, id_avatar, id_item_avatar, equipado, fecha_obtencion FROM "InventariosAvatares" ORDER BY id DESC`;
    return await BD.query(sql);
  };

  getByIdAsync = async (id) => {
    console.log(`InventarioAvatarRepository.getByIdAsync(${id})`);
    const sql = `SELECT id, id_avatar, id_item_avatar, equipado, fecha_obtencion FROM "InventariosAvatares" WHERE id = $1`;
    return await BD.queryOne(sql, [id]);
  };

  getByAvatarIdAsync = async (idAvatar) => {
    console.log(`InventarioAvatarRepository.getByAvatarIdAsync(${idAvatar})`);
    const sql = `SELECT id, id_avatar, id_item_avatar, equipado, fecha_obtencion FROM "InventariosAvatares" WHERE id_avatar = $1 ORDER BY id DESC`;
    return await BD.query(sql, [idAvatar]);
  };

  getByAvatarAndItemAsync = async (idAvatar, idItemAvatar) => {
    console.log(`InventarioAvatarRepository.getByAvatarAndItemAsync(${idAvatar}, ${idItemAvatar})`);
    const sql = `SELECT id, id_avatar, id_item_avatar, equipado, fecha_obtencion FROM "InventariosAvatares" WHERE id_avatar = $1 AND id_item_avatar = $2`;
    return await BD.queryOne(sql, [idAvatar, idItemAvatar]);
  };

  createAsync = async (entity) => {
    console.log(`InventarioAvatarRepository.createAsync(${JSON.stringify(entity)})`);
    const sql = `
      INSERT INTO "InventariosAvatares" (id_avatar, id_item_avatar, equipado, fecha_obtencion)
      VALUES ($1, $2, COALESCE($3, false), $4)
      RETURNING id
    `;
    const values = [
      entity?.id_avatar,
      entity?.id_item_avatar,
      entity?.equipado ?? false,
      entity?.fecha_obtencion,
    ];
    const result = await BD.queryOne(sql, values);
    return result?.id ?? 0;
  };

  updateAsync = async (entity) => {
    console.log(`InventarioAvatarRepository.updateAsync(${JSON.stringify(entity)})`);
    const id = entity.id;
    const previousEntity = await this.getByIdAsync(id);
    if (previousEntity == null) return 0;
    const sql = `
      UPDATE "InventariosAvatares"
      SET id_avatar = $2, id_item_avatar = $3, equipado = $4, fecha_obtencion = $5
      WHERE id = $1
    `;
    const values = [
      id,
      entity?.id_avatar ?? previousEntity.id_avatar,
      entity?.id_item_avatar ?? previousEntity.id_item_avatar,
      entity?.equipado ?? previousEntity.equipado,
      entity?.fecha_obtencion ?? previousEntity.fecha_obtencion,
    ];
    return await BD.execute(sql, values);
  };

  deleteByIdAsync = async (id) => {
    console.log(`InventarioAvatarRepository.deleteByIdAsync(${id})`);
    const sql = `DELETE FROM "InventariosAvatares" WHERE id = $1`;
    return await BD.execute(sql, [id]);
  };
}
