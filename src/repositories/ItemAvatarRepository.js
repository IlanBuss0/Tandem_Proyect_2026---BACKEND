import BD from '../db/BD.js';

export default class ItemAvatarRepository {
  constructor() {
    console.log('Estoy en: ItemAvatarRepository.constructor()');
  }

  getAllAsync = async () => {
    console.log('ItemAvatarRepository.getAllAsync()');
    const sql = `SELECT id, id_tipo_item_avatar, nombre, codigo_item_externo, precio_punto, requiere_cantidad_actividad, requiere_id_dificultad_actividad, activo FROM "ItemsAvatares" ORDER BY id DESC`;
    return await BD.query(sql);
  };

  getByIdAsync = async (id) => {
    console.log(`ItemAvatarRepository.getByIdAsync(${id})`);
    const sql = `SELECT id, id_tipo_item_avatar, nombre, codigo_item_externo, precio_punto, requiere_cantidad_actividad, requiere_id_dificultad_actividad, activo FROM "ItemsAvatares" WHERE id = $1`;
    return await BD.queryOne(sql, [id]);
  };

  createAsync = async (entity) => {
    console.log(`ItemAvatarRepository.createAsync(${JSON.stringify(entity)})`);
    const sql = `
      INSERT INTO "ItemsAvatares" (id_tipo_item_avatar, nombre, codigo_item_externo, precio_punto, requiere_cantidad_actividad, requiere_id_dificultad_actividad, activo)
      VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, true))
      RETURNING id
    `;
    const values = [
      entity?.id_tipo_item_avatar,
      entity?.nombre,
      entity?.codigo_item_externo ?? null,
      entity?.precio_punto,
      entity?.requiere_cantidad_actividad ?? null,
      entity?.requiere_id_dificultad_actividad ?? null,
      entity?.activo ?? true,
    ];
    const result = await BD.queryOne(sql, values);
    return result?.id ?? 0;
  };

  updateAsync = async (entity) => {
    console.log(`ItemAvatarRepository.updateAsync(${JSON.stringify(entity)})`);
    const id = entity.id;
    const previousEntity = await this.getByIdAsync(id);
    if (previousEntity == null) return 0;
    const sql = `
      UPDATE "ItemsAvatares"
      SET id_tipo_item_avatar = $2, nombre = $3, codigo_item_externo = $4, precio_punto = $5, requiere_cantidad_actividad = $6, requiere_id_dificultad_actividad = $7, activo = $8
      WHERE id = $1
    `;
    const values = [
      id,
      entity?.id_tipo_item_avatar ?? previousEntity.id_tipo_item_avatar,
      entity?.nombre ?? previousEntity.nombre,
      entity?.codigo_item_externo ?? previousEntity.codigo_item_externo,
      entity?.precio_punto ?? previousEntity.precio_punto,
      entity?.requiere_cantidad_actividad ?? previousEntity.requiere_cantidad_actividad,
      entity?.requiere_id_dificultad_actividad ?? previousEntity.requiere_id_dificultad_actividad,
      entity?.activo ?? previousEntity.activo,
    ];
    return await BD.execute(sql, values);
  };

  deleteByIdAsync = async (id) => {
    console.log(`ItemAvatarRepository.deleteByIdAsync(${id})`);
    const sql = `UPDATE "ItemsAvatares" SET activo = false WHERE id = $1`;
    return await BD.execute(sql, [id]);
  };
}
