import BD from '../db/BD.js';

export default class VinculoTutorPertenecienteRepository {
  constructor() {
    console.log('Estoy en: VinculoTutorPertenecienteRepository.constructor()');
  }

  getAllAsync = async () => {
    console.log('VinculoTutorPertenecienteRepository.getAllAsync()');

    const sql = `
      SELECT
        id,
        id_tutor,
        id_perteneciente,
        es_tutor_principal,
        id_estado_vinculo,
        fecha_alta,
        fecha_fin,
        id_usuario_creador
      FROM "VinculosTutorPertenecientes"
      ORDER BY id DESC
    `;

    return await BD.query(sql);
  };

  getByIdAsync = async (id) => {
    console.log(`VinculoTutorPertenecienteRepository.getByIdAsync(${id})`);

    const sql = `
      SELECT
        id,
        id_tutor,
        id_perteneciente,
        es_tutor_principal,
        id_estado_vinculo,
        fecha_alta,
        fecha_fin,
        id_usuario_creador
      FROM "VinculosTutorPertenecientes"
      WHERE id = $1
    `;

    return await BD.queryOne(sql, [id]);
  };

  getByPertenecienteIdAsync = async (idPerteneciente) => {
    console.log(`VinculoTutorPertenecienteRepository.getByPertenecienteIdAsync(${idPerteneciente})`);

    const sql = `
      SELECT
        id,
        id_tutor,
        id_perteneciente,
        es_tutor_principal,
        id_estado_vinculo,
        fecha_alta,
        fecha_fin,
        id_usuario_creador
      FROM "VinculosTutorPertenecientes"
      WHERE id_perteneciente = $1
      ORDER BY es_tutor_principal DESC, id DESC
    `;

    return await BD.query(sql, [idPerteneciente]);
  };

  getByTutorIdAsync = async (idTutor) => {
    console.log(`VinculoTutorPertenecienteRepository.getByTutorIdAsync(${idTutor})`);

    const sql = `
      SELECT
        id,
        id_tutor,
        id_perteneciente,
        es_tutor_principal,
        id_estado_vinculo,
        fecha_alta,
        fecha_fin,
        id_usuario_creador
      FROM "VinculosTutorPertenecientes"
      WHERE id_tutor = $1
      ORDER BY id DESC
    `;

    return await BD.query(sql, [idTutor]);
  };

  getByTutorYPertenecienteAsync = async (idTutor, idPerteneciente) => {
    console.log(`VinculoTutorPertenecienteRepository.getByTutorYPertenecienteAsync(${idTutor}, ${idPerteneciente})`);

    const sql = `
      SELECT
        id,
        id_tutor,
        id_perteneciente,
        es_tutor_principal,
        id_estado_vinculo,
        fecha_alta,
        fecha_fin,
        id_usuario_creador
      FROM "VinculosTutorPertenecientes"
      WHERE id_tutor = $1
        AND id_perteneciente = $2
    `;

    return await BD.queryOne(sql, [idTutor, idPerteneciente]);
  };

  getTutorPrincipalByPertenecienteAsync = async (idPerteneciente) => {
    console.log(`VinculoTutorPertenecienteRepository.getTutorPrincipalByPertenecienteAsync(${idPerteneciente})`);

    const sql = `
      SELECT
        id,
        id_tutor,
        id_perteneciente,
        es_tutor_principal,
        id_estado_vinculo,
        fecha_alta,
        fecha_fin,
        id_usuario_creador
      FROM "VinculosTutorPertenecientes"
      WHERE id_perteneciente = $1
        AND es_tutor_principal = true
        AND fecha_fin IS NULL
    `;

    return await BD.queryOne(sql, [idPerteneciente]);
  };

  createAsync = async (entity) => {
    console.log(`VinculoTutorPertenecienteRepository.createAsync(${JSON.stringify(entity)})`);

    const sql = `
      INSERT INTO "VinculosTutorPertenecientes" (
        id_tutor,
        id_perteneciente,
        es_tutor_principal,
        id_estado_vinculo,
        fecha_alta,
        fecha_fin,
        id_usuario_creador
      )
      VALUES (
        $1,
        $2,
        COALESCE($3, false),
        $4,
        $5,
        $6,
        $7
      )
      RETURNING id
    `;

    const values = [
      entity?.id_tutor,
      entity?.id_perteneciente,
      entity?.es_tutor_principal ?? false,
      entity?.id_estado_vinculo,
      entity?.fecha_alta,
      entity?.fecha_fin ?? null,
      entity?.id_usuario_creador ?? null,
    ];

    const result = await BD.queryOne(sql, values);

    return result?.id ?? 0;
  };

  updateAsync = async (entity) => {
    console.log(`VinculoTutorPertenecienteRepository.updateAsync(${JSON.stringify(entity)})`);

    const id = entity.id;

    const previousEntity = await this.getByIdAsync(id);

    if (previousEntity == null) return 0;

    const sql = `
      UPDATE "VinculosTutorPertenecientes"
      SET
        id_tutor = $2,
        id_perteneciente = $3,
        es_tutor_principal = $4,
        id_estado_vinculo = $5,
        fecha_alta = $6,
        fecha_fin = $7,
        id_usuario_creador = $8
      WHERE id = $1
    `;

    const values = [
      id,
      entity?.id_tutor ?? previousEntity.id_tutor,
      entity?.id_perteneciente ?? previousEntity.id_perteneciente,
      entity?.es_tutor_principal ?? previousEntity.es_tutor_principal,
      entity?.id_estado_vinculo ?? previousEntity.id_estado_vinculo,
      entity?.fecha_alta ?? previousEntity.fecha_alta,
      entity?.fecha_fin ?? previousEntity.fecha_fin,
      entity?.id_usuario_creador ?? previousEntity.id_usuario_creador,
    ];

    return await BD.execute(sql, values);
  };

  deleteByIdAsync = async (id) => {
    console.log(`VinculoTutorPertenecienteRepository.deleteByIdAsync(${id})`);

    const sql = `
      UPDATE "VinculosTutorPertenecientes"
      SET fecha_fin = CURRENT_DATE
      WHERE id = $1
        AND fecha_fin IS NULL
    `;

    return await BD.execute(sql, [id]);
  };
}