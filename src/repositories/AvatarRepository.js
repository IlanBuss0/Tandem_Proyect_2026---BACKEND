import BD from '../db/BD.js';

export default class AvatarRepository {
  constructor() {
    console.log('Estoy en: AvatarRepository.constructor()');
  }

  getAllAsync = async () => {
    console.log('AvatarRepository.getAllAsync()');
    const sql = `SELECT id, id_perteneciente, nivel, experiencia, avatar_api, avatar_externo_id, avatar_json FROM "Avatares" ORDER BY id DESC`;
    return await BD.query(sql);
  };

  getByIdAsync = async (id) => {
    console.log(`AvatarRepository.getByIdAsync(${id})`);
    const sql = `SELECT id, id_perteneciente, nivel, experiencia, avatar_api, avatar_externo_id, avatar_json FROM "Avatares" WHERE id = $1`;
    return await BD.queryOne(sql, [id]);
  };

  getByPertenecienteIdAsync = async (idPerteneciente) => {
    console.log(`AvatarRepository.getByPertenecienteIdAsync(${idPerteneciente})`);
    const sql = `SELECT id, id_perteneciente, nivel, experiencia, avatar_api, avatar_externo_id, avatar_json FROM "Avatares" WHERE id_perteneciente = $1`;
    return await BD.queryOne(sql, [idPerteneciente]);
  };

  createAsync = async (entity) => {
    console.log(`AvatarRepository.createAsync(${JSON.stringify(entity)})`);
    const sql = `
      INSERT INTO "Avatares" (id_perteneciente, nivel, experiencia, avatar_api, avatar_externo_id, avatar_json)
      VALUES ($1, COALESCE($2, 1), COALESCE($3, 0), $4, $5, $6)
      RETURNING id
    `;
    const values = [
      entity?.id_perteneciente,
      entity?.nivel ?? 1,
      entity?.experiencia ?? 0,
      entity?.avatar_api ?? null,
      entity?.avatar_externo_id ?? null,
      entity?.avatar_json ?? null,
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
      UPDATE "Avatares"
      SET id_perteneciente = $2, nivel = $3, experiencia = $4, avatar_api = $5, avatar_externo_id = $6, avatar_json = $7
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
    ];
    return await BD.execute(sql, values);
  };

  deleteByIdAsync = async (id) => {
    console.log(`AvatarRepository.deleteByIdAsync(${id})`);
    const sql = `DELETE FROM "Avatares" WHERE id = $1`;
    return await BD.execute(sql, [id]);
  };
}
