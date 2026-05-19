import BD from '../db/BD.js';

export default class PagoSuscripcionRepository {
  constructor() {
    console.log('Estoy en: PagoSuscripcionRepository.constructor()');
  }

  getAllAsync = async () => {
    console.log('PagoSuscripcionRepository.getAllAsync()');
    const sql = `SELECT id, id_suscripcion, id_estado_pago, monto, comprobante_url, pagado, fecha_pago FROM pagos_suscripciones ORDER BY id DESC`;
    return await BD.query(sql);
  };

  getByIdAsync = async (id) => {
    console.log(`PagoSuscripcionRepository.getByIdAsync(${id})`);
    const sql = `SELECT id, id_suscripcion, id_estado_pago, monto, comprobante_url, pagado, fecha_pago FROM pagos_suscripciones WHERE id = $1`;
    return await BD.queryOne(sql, [id]);
  };

  createAsync = async (entity) => {
    console.log(`PagoSuscripcionRepository.createAsync(${JSON.stringify(entity)})`);
    const sql = `INSERT INTO pagos_suscripciones (id_suscripcion, id_estado_pago, monto, comprobante_url, pagado, fecha_pago) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`;
    const values = [entity?.id_suscripcion ?? null, entity?.id_estado_pago ?? null, entity?.monto ?? null, entity?.comprobante_url ?? null, entity?.pagado ?? null, entity?.fecha_pago ?? null];
    const result = await BD.queryOne(sql, values);
    return result?.id ?? 0;
  };

  updateAsync = async (entity) => {
    console.log(`PagoSuscripcionRepository.updateAsync(${JSON.stringify(entity)})`);
    const id = entity.id;
    const previousEntity = await this.getByIdAsync(id);
    if (previousEntity == null) return 0;
    const sql = `UPDATE pagos_suscripciones SET id_suscripcion = $2, id_estado_pago = $3, monto = $4, comprobante_url = $5, pagado = $6, fecha_pago = $7 WHERE id = $1`;
    const values = [id, entity?.id_suscripcion ?? previousEntity.id_suscripcion, entity?.id_estado_pago ?? previousEntity.id_estado_pago, entity?.monto ?? previousEntity.monto, entity?.comprobante_url ?? previousEntity.comprobante_url, entity?.pagado ?? previousEntity.pagado, entity?.fecha_pago ?? previousEntity.fecha_pago];
    return await BD.execute(sql, values);
  };

  deleteByIdAsync = async (id) => {
    console.log(`PagoSuscripcionRepository.deleteByIdAsync(${id})`);
    const sql = `DELETE FROM pagos_suscripciones WHERE id = $1`;
    return await BD.execute(sql, [id]);
  };
}
