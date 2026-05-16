import BD from '../db/BD.js';

export default class EvaluacionAutonomiaRepository {
  constructor() {
    console.log('Estoy en: EvaluacionAutonomiaRepository.constructor()');
  }

  getAllAsync = async () => {
    console.log('EvaluacionAutonomiaRepository.getAllAsync()');
    const sql = `SELECT id, id_perteneciente, id_profesional, id_nivel_apoyo_anterior, id_nivel_apoyo_nuevo, id_autonomia_operativa_anterior, id_autonomia_operativa_nueva, puede_autogestionarse_nuevo, observacion, fecha_evaluacion FROM "EvaluacionesAutonomias" ORDER BY id DESC`;
    return await BD.query(sql);
  };

  getByIdAsync = async (id) => {
    console.log(`EvaluacionAutonomiaRepository.getByIdAsync(${id})`);
    const sql = `SELECT id, id_perteneciente, id_profesional, id_nivel_apoyo_anterior, id_nivel_apoyo_nuevo, id_autonomia_operativa_anterior, id_autonomia_operativa_nueva, puede_autogestionarse_nuevo, observacion, fecha_evaluacion FROM "EvaluacionesAutonomias" WHERE id = $1`;
    return await BD.queryOne(sql, [id]);
  };

  getByPertenecienteIdAsync = async (idPerteneciente) => {
    console.log(`EvaluacionAutonomiaRepository.getByPertenecienteIdAsync(${idPerteneciente})`);
    const sql = `SELECT id, id_perteneciente, id_profesional, id_nivel_apoyo_anterior, id_nivel_apoyo_nuevo, id_autonomia_operativa_anterior, id_autonomia_operativa_nueva, puede_autogestionarse_nuevo, observacion, fecha_evaluacion FROM "EvaluacionesAutonomias" WHERE id_perteneciente = $1 ORDER BY id DESC`;
    return await BD.query(sql, [idPerteneciente]);
  };

  createAsync = async (entity) => {
    console.log(`EvaluacionAutonomiaRepository.createAsync(${JSON.stringify(entity)})`);
    const sql = `
      INSERT INTO "EvaluacionesAutonomias" (id_perteneciente, id_profesional, id_nivel_apoyo_anterior, id_nivel_apoyo_nuevo, id_autonomia_operativa_anterior, id_autonomia_operativa_nueva, puede_autogestionarse_nuevo, observacion, fecha_evaluacion)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `;
    const values = [
      entity?.id_perteneciente,
      entity?.id_profesional ?? null,
      entity?.id_nivel_apoyo_anterior ?? null,
      entity?.id_nivel_apoyo_nuevo,
      entity?.id_autonomia_operativa_anterior ?? null,
      entity?.id_autonomia_operativa_nueva,
      entity?.puede_autogestionarse_nuevo,
      entity?.observacion ?? null,
      entity?.fecha_evaluacion,
    ];
    const result = await BD.queryOne(sql, values);
    return result?.id ?? 0;
  };

  updateAsync = async (entity) => {
    console.log(`EvaluacionAutonomiaRepository.updateAsync(${JSON.stringify(entity)})`);
    const id = entity.id;
    const previousEntity = await this.getByIdAsync(id);
    if (previousEntity == null) return 0;
    const sql = `
      UPDATE "EvaluacionesAutonomias"
      SET id_perteneciente = $2, id_profesional = $3, id_nivel_apoyo_anterior = $4, id_nivel_apoyo_nuevo = $5, id_autonomia_operativa_anterior = $6, id_autonomia_operativa_nueva = $7, puede_autogestionarse_nuevo = $8, observacion = $9, fecha_evaluacion = $10
      WHERE id = $1
    `;
    const values = [
      id,
      entity?.id_perteneciente ?? previousEntity.id_perteneciente,
      entity?.id_profesional ?? previousEntity.id_profesional,
      entity?.id_nivel_apoyo_anterior ?? previousEntity.id_nivel_apoyo_anterior,
      entity?.id_nivel_apoyo_nuevo ?? previousEntity.id_nivel_apoyo_nuevo,
      entity?.id_autonomia_operativa_anterior ?? previousEntity.id_autonomia_operativa_anterior,
      entity?.id_autonomia_operativa_nueva ?? previousEntity.id_autonomia_operativa_nueva,
      entity?.puede_autogestionarse_nuevo ?? previousEntity.puede_autogestionarse_nuevo,
      entity?.observacion ?? previousEntity.observacion,
      entity?.fecha_evaluacion ?? previousEntity.fecha_evaluacion,
    ];
    return await BD.execute(sql, values);
  };

  deleteByIdAsync = async (id) => {
    console.log(`EvaluacionAutonomiaRepository.deleteByIdAsync(${id})`);
    const sql = `DELETE FROM "EvaluacionesAutonomias" WHERE id = $1`;
    return await BD.execute(sql, [id]);
  };
}
