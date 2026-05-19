import BD from '../db/BD.js';

export default class PlanSuscripcionRepository {
  constructor() {
    console.log('Estoy en: PlanSuscripcionRepository.constructor()');
  }

  getAllAsync = async () => {
    console.log('PlanSuscripcionRepository.getAllAsync()');
    const sql = `SELECT id, nombre_plan, descripcion, precio_mensual, precio_anual, activo FROM planes_suscripciones ORDER BY id DESC`;
    return await BD.query(sql);
  };

  getByIdAsync = async (id) => {
    console.log(`PlanSuscripcionRepository.getByIdAsync(${id})`);
    const sql = `SELECT id, nombre_plan, descripcion, precio_mensual, precio_anual, activo FROM planes_suscripciones WHERE id = $1`;
    return await BD.queryOne(sql, [id]);
  };

  createAsync = async (entity) => {
    console.log(`PlanSuscripcionRepository.createAsync(${JSON.stringify(entity)})`);
    const sql = `INSERT INTO planes_suscripciones (nombre_plan, descripcion, precio_mensual, precio_anual, activo) VALUES ($1, $2, $3, $4, $5) RETURNING id`;
    const values = [entity?.nombre_plan ?? null, entity?.descripcion ?? null, entity?.precio_mensual ?? null, entity?.precio_anual ?? null, entity?.activo ?? null];
    const result = await BD.queryOne(sql, values);
    return result?.id ?? 0;
  };

  updateAsync = async (entity) => {
    console.log(`PlanSuscripcionRepository.updateAsync(${JSON.stringify(entity)})`);
    const id = entity.id;
    const previousEntity = await this.getByIdAsync(id);
    if (previousEntity == null) return 0;
    const sql = `UPDATE planes_suscripciones SET nombre_plan = $2, descripcion = $3, precio_mensual = $4, precio_anual = $5, activo = $6 WHERE id = $1`;
    const values = [id, entity?.nombre_plan ?? previousEntity.nombre_plan, entity?.descripcion ?? previousEntity.descripcion, entity?.precio_mensual ?? previousEntity.precio_mensual, entity?.precio_anual ?? previousEntity.precio_anual, entity?.activo ?? previousEntity.activo];
    return await BD.execute(sql, values);
  };

  deleteByIdAsync = async (id) => {
    console.log(`PlanSuscripcionRepository.deleteByIdAsync(${id})`);
    const sql = `DELETE FROM planes_suscripciones WHERE id = $1`;
    return await BD.execute(sql, [id]);
  };
}
