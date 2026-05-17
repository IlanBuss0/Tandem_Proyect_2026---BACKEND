import BD from '../db/BD.js';

export default class MovimientoPuntoRepository {
  constructor() {
    console.log('Estoy en: MovimientoPuntoRepository.constructor()');
  }

  getAllAsync = async () => {
    console.log('MovimientoPuntoRepository.getAllAsync()');
    const sql = `SELECT id, id_perteneciente, id_tipo_movimiento_punto, cantidad, descripcion, fecha_movimiento FROM movimientos_puntos ORDER BY id DESC`;
    return await BD.query(sql);
  };

  getByIdAsync = async (id) => {
    console.log(`MovimientoPuntoRepository.getByIdAsync(${id})`);
    const sql = `SELECT id, id_perteneciente, id_tipo_movimiento_punto, cantidad, descripcion, fecha_movimiento FROM movimientos_puntos WHERE id = $1`;
    return await BD.queryOne(sql, [id]);
  };

  getByPertenecienteIdAsync = async (idPerteneciente) => {
    console.log(`MovimientoPuntoRepository.getByPertenecienteIdAsync(${idPerteneciente})`);
    const sql = `SELECT id, id_perteneciente, id_tipo_movimiento_punto, cantidad, descripcion, fecha_movimiento FROM movimientos_puntos WHERE id_perteneciente = $1 ORDER BY id DESC`;
    return await BD.query(sql, [idPerteneciente]);
  };

  createAsync = async (entity) => {
    console.log(`MovimientoPuntoRepository.createAsync(${JSON.stringify(entity)})`);
    const sql = `
      INSERT INTO movimientos_puntos (id_perteneciente, id_tipo_movimiento_punto, cantidad, descripcion, fecha_movimiento)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;
    const values = [
      entity?.id_perteneciente,
      entity?.id_tipo_movimiento_punto,
      entity?.cantidad,
      entity?.descripcion ?? null,
      entity?.fecha_movimiento,
    ];
    const result = await BD.queryOne(sql, values);
    return result?.id ?? 0;
  };

  updateAsync = async (entity) => {
    console.log(`MovimientoPuntoRepository.updateAsync(${JSON.stringify(entity)})`);
    const id = entity.id;
    const previousEntity = await this.getByIdAsync(id);
    if (previousEntity == null) return 0;
    const sql = `
      UPDATE movimientos_puntos
      SET id_perteneciente = $2, id_tipo_movimiento_punto = $3, cantidad = $4, descripcion = $5, fecha_movimiento = $6
      WHERE id = $1
    `;
    const values = [
      id,
      entity?.id_perteneciente ?? previousEntity.id_perteneciente,
      entity?.id_tipo_movimiento_punto ?? previousEntity.id_tipo_movimiento_punto,
      entity?.cantidad ?? previousEntity.cantidad,
      entity?.descripcion ?? previousEntity.descripcion,
      entity?.fecha_movimiento ?? previousEntity.fecha_movimiento,
    ];
    return await BD.execute(sql, values);
  };

  deleteByIdAsync = async (id) => {
    console.log(`MovimientoPuntoRepository.deleteByIdAsync(${id})`);
    const sql = `DELETE FROM movimientos_puntos WHERE id = $1`;
    return await BD.execute(sql, [id]);
  };
}
