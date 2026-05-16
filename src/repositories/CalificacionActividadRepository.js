import BD from '../db/BD.js';

export default class CalificacionActividadRepository {
  constructor() {
    console.log('Estoy en: CalificacionActividadRepository.constructor()');
  }

  getAllAsync = async () => {
    console.log('CalificacionActividadRepository.getAllAsync()');

    const sql = `
      SELECT
        id,
        id_perteneciente,
        id_actividad,
        id_actividad_personalizada,
        puntaje_usuario,
        id_dificultad_actividad,
        fecha_calificacion
      FROM "CalificacionesActividades"
      ORDER BY id DESC
    `;

    return await BD.query(sql);
  };

  getByIdAsync = async (id) => {
    console.log(`CalificacionActividadRepository.getByIdAsync(${id})`);

    const sql = `
      SELECT
        id,
        id_perteneciente,
        id_actividad,
        id_actividad_personalizada,
        puntaje_usuario,
        id_dificultad_actividad,
        fecha_calificacion
      FROM "CalificacionesActividades"
      WHERE id = $1
    `;

    return await BD.queryOne(sql, [id]);
  };

  getByPertenecienteIdAsync = async (idPerteneciente) => {
    console.log(`CalificacionActividadRepository.getByPertenecienteIdAsync(${idPerteneciente})`);

    const sql = `
      SELECT
        id,
        id_perteneciente,
        id_actividad,
        id_actividad_personalizada,
        puntaje_usuario,
        id_dificultad_actividad,
        fecha_calificacion
      FROM "CalificacionesActividades"
      WHERE id_perteneciente = $1
      ORDER BY id DESC
    `;

    return await BD.query(sql, [idPerteneciente]);
  };

  createAsync = async (entity) => {
    console.log(`CalificacionActividadRepository.createAsync(${JSON.stringify(entity)})`);

    const sql = `
      INSERT INTO "CalificacionesActividades" (
        id_perteneciente,
        id_actividad,
        id_actividad_personalizada,
        puntaje_usuario,
        id_dificultad_actividad,
        fecha_calificacion
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6
      )
      RETURNING id
    `;

    const values = [
      entity?.id_perteneciente,
      entity?.id_actividad ?? null,
      entity?.id_actividad_personalizada ?? null,
      entity?.puntaje_usuario,
      entity?.id_dificultad_actividad ?? null,
      entity?.fecha_calificacion,
    ];

    const result = await BD.queryOne(sql, values);

    return result?.id ?? 0;
  };

  updateAsync = async (entity) => {
    console.log(`CalificacionActividadRepository.updateAsync(${JSON.stringify(entity)})`);

    const id = entity.id;

    const previousEntity = await this.getByIdAsync(id);

    if (previousEntity == null) return 0;

    const sql = `
      UPDATE "CalificacionesActividades"
      SET
        id_perteneciente = $2,
        id_actividad = $3,
        id_actividad_personalizada = $4,
        puntaje_usuario = $5,
        id_dificultad_actividad = $6,
        fecha_calificacion = $7
      WHERE id = $1
    `;

    const values = [
      id,
      entity?.id_perteneciente ?? previousEntity.id_perteneciente,
      entity?.id_actividad ?? previousEntity.id_actividad,
      entity?.id_actividad_personalizada ?? previousEntity.id_actividad_personalizada,
      entity?.puntaje_usuario ?? previousEntity.puntaje_usuario,
      entity?.id_dificultad_actividad ?? previousEntity.id_dificultad_actividad,
      entity?.fecha_calificacion ?? previousEntity.fecha_calificacion,
    ];

    return await BD.execute(sql, values);
  };

  deleteByIdAsync = async (id) => {
    console.log(`CalificacionActividadRepository.deleteByIdAsync(${id})`);

    const sql = `
      DELETE FROM "CalificacionesActividades"
      WHERE id = $1
    `;

    return await BD.execute(sql, [id]);
  };
}
