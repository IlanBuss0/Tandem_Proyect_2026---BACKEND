import BD from '../db/BD.js';

export default class AvatarRepository {
  constructor() {
    console.log('Estoy en: AvatarRepository.constructor()');
  }

  avatarColumns = `
    id, id_perteneciente, nivel, experiencia, avatar_api, avatar_externo_id, avatar_json,
    avatar_imagen_url, avatar_imagen_path, avatar_imagen_content_type, avatar_imagen_actualizada_en,
    avatar_imagen_origen_url
  `;

  getAllAsync = async () => {
    console.log('AvatarRepository.getAllAsync()');
    const sql = `SELECT ${this.avatarColumns} FROM avatares ORDER BY id DESC`;
    return await BD.query(sql);
  };

  getByIdAsync = async (id) => {
    console.log(`AvatarRepository.getByIdAsync(${id})`);
    const sql = `SELECT ${this.avatarColumns} FROM avatares WHERE id = $1`;
    return await BD.queryOne(sql, [id]);
  };

  getByPertenecienteIdAsync = async (idPerteneciente) => {
    console.log(`AvatarRepository.getByPertenecienteIdAsync(${idPerteneciente})`);
    const sql = `SELECT ${this.avatarColumns} FROM avatares WHERE id_perteneciente = $1`;
    return await BD.queryOne(sql, [idPerteneciente]);
  };

  createAsync = async (entity) => {
    console.log(`AvatarRepository.createAsync(${JSON.stringify(entity)})`);
    const sql = `
      INSERT INTO avatares (
        id_perteneciente, nivel, experiencia, avatar_api, avatar_externo_id, avatar_json,
        avatar_imagen_url, avatar_imagen_path, avatar_imagen_content_type, avatar_imagen_actualizada_en,
        avatar_imagen_origen_url
      )
      VALUES ($1, COALESCE($2, 1), COALESCE($3, 0), $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id
    `;
    const values = [
      entity?.id_perteneciente,
      entity?.nivel ?? 1,
      entity?.experiencia ?? 0,
      entity?.avatar_api ?? null,
      entity?.avatar_externo_id ?? null,
      entity?.avatar_json ?? null,
      entity?.avatar_imagen_url ?? null,
      entity?.avatar_imagen_path ?? null,
      entity?.avatar_imagen_content_type ?? null,
      entity?.avatar_imagen_actualizada_en ?? null,
      entity?.avatar_imagen_origen_url ?? null,
    ];
    const result = await BD.queryOne(sql, values);
    return result?.id ?? 0;
  };

  updateAsync = async (entity) => {
    console.log(`AvatarRepository.updateAsync(${JSON.stringify(entity)})`);
    const id = entity.id;
    const previousEntity = await this.getByIdAsync(id);
    if (previousEntity == null) return 0;
    const sql = `
      UPDATE avatares
      SET id_perteneciente = $2,
          nivel = $3,
          experiencia = $4,
          avatar_api = $5,
          avatar_externo_id = $6,
          avatar_json = $7,
          avatar_imagen_url = $8,
          avatar_imagen_path = $9,
          avatar_imagen_content_type = $10,
          avatar_imagen_actualizada_en = $11,
          avatar_imagen_origen_url = $12
      WHERE id = $1
    `;
    const values = [
      id,
      entity?.id_perteneciente ?? previousEntity.id_perteneciente,
      entity?.nivel ?? previousEntity.nivel,
      entity?.experiencia ?? previousEntity.experiencia,
      entity?.avatar_api ?? previousEntity.avatar_api,
      entity?.avatar_externo_id ?? previousEntity.avatar_externo_id,
      entity?.avatar_json ?? previousEntity.avatar_json,
      entity?.avatar_imagen_url ?? previousEntity.avatar_imagen_url,
      entity?.avatar_imagen_path ?? previousEntity.avatar_imagen_path,
      entity?.avatar_imagen_content_type ?? previousEntity.avatar_imagen_content_type,
      entity?.avatar_imagen_actualizada_en ?? previousEntity.avatar_imagen_actualizada_en,
      entity?.avatar_imagen_origen_url ?? previousEntity.avatar_imagen_origen_url,
    ];
    return await BD.execute(sql, values);
  };

  updateAvatarImageAsync = async (id, imageData) => {
    console.log(`AvatarRepository.updateAvatarImageAsync(${id})`);
    const sql = `
      UPDATE avatares
      SET avatar_imagen_url = $2,
          avatar_imagen_path = $3,
          avatar_imagen_content_type = $4,
          avatar_imagen_actualizada_en = NOW(),
          avatar_imagen_origen_url = $5
      WHERE id = $1
    `;
    return await BD.execute(sql, [
      id,
      imageData?.url ?? null,
      imageData?.path ?? null,
      imageData?.contentType ?? null,
      imageData?.sourceUrl ?? null,
    ]);
  };

  deleteByIdAsync = async (id) => {
    console.log(`AvatarRepository.deleteByIdAsync(${id})`);
    const sql = `DELETE FROM avatares WHERE id = $1`;
    return await BD.execute(sql, [id]);
  };
}
