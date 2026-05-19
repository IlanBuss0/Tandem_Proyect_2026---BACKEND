import BD from '../db/BD.js';

export default class PuntoOtorgadoRepository {
  constructor() {
    console.log('Estoy en: PuntoOtorgadoRepository.constructor()');
  }

  getAllAsync = async () => {
    console.log('PuntoOtorgadoRepository.getAllAsync()');
    const sql = `SELECT id, nombre, orden FROM puntos_otorgados ORDER BY id DESC`;
    return await BD.query(sql);
  };

  getByIdAsync = async (id) => {
    console.log(`PuntoOtorgadoRepository.getByIdAsync(${id})`);
    const sql = `SELECT id, nombre, orden FROM puntos_otorgados WHERE id = $1`;
    return await BD.queryOne(sql, [id]);
  };

  createAsync = async (entity) => {
    console.log(`PuntoOtorgadoRepository.createAsync(${JSON.stringify(entity)})`);
    const sql = `INSERT INTO puntos_otorgados (nombre, orden) VALUES ($1, $2) RETURNING id`;
    const values = [entity?.nombre ?? null, entity?.orden ?? null];
    const result = await BD.queryOne(sql, values);
    return result?.id ?? 0;
  };

  updateAsync = async (entity) => {
    console.log(`PuntoOtorgadoRepository.updateAsync(${JSON.stringify(entity)})`);
    const id = entity.id;
    const previousEntity = await this.getByIdAsync(id);
    if (previousEntity == null) return 0;
    const sql = `UPDATE puntos_otorgados SET nombre = $2, orden = $3 WHERE id = $1`;
    const values = [id, entity?.nombre ?? previousEntity.nombre, entity?.orden ?? previousEntity.orden];
    return await BD.execute(sql, values);
  };

  deleteByIdAsync = async (id) => {
    console.log(`PuntoOtorgadoRepository.deleteByIdAsync(${id})`);
    const sql = `DELETE FROM puntos_otorgados WHERE id = $1`;
    return await BD.execute(sql, [id]);
  };
}
