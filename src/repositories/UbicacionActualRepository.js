import BD from '../db/BD.js';

export default class UbicacionActualRepository {
  constructor() {
    console.log('Estoy en: UbicacionActualRepository.constructor()');
  }

  getAllAsync = async () => {
    console.log('UbicacionActualRepository.getAllAsync()');
    const sql = `SELECT id, id_dispositivo, latitud, longitud, fecha_registro FROM "UbicacionesActuales" ORDER BY id DESC`;
    return await BD.query(sql);
  };

  getByIdAsync = async (id) => {
    console.log(`UbicacionActualRepository.getByIdAsync(${id})`);
    const sql = `SELECT id, id_dispositivo, latitud, longitud, fecha_registro FROM "UbicacionesActuales" WHERE id = $1`;
    return await BD.queryOne(sql, [id]);
  };

  getByDispositivoIdAsync = async (idDispositivo) => {
    console.log(`UbicacionActualRepository.getByDispositivoIdAsync(${idDispositivo})`);
    const sql = `SELECT id, id_dispositivo, latitud, longitud, fecha_registro FROM "UbicacionesActuales" WHERE id_dispositivo = $1`;
    return await BD.queryOne(sql, [idDispositivo]);
  };

  createAsync = async (entity) => {
    console.log(`UbicacionActualRepository.createAsync(${JSON.stringify(entity)})`);
    const sql = `INSERT INTO "UbicacionesActuales" (id_dispositivo, latitud, longitud, fecha_registro) VALUES ($1, $2, $3, $4) RETURNING id`;
    const values = [entity?.id_dispositivo, entity?.latitud, entity?.longitud, entity?.fecha_registro];
    const result = await BD.queryOne(sql, values);
    return result?.id ?? 0;
  };

  updateAsync = async (entity) => {
    console.log(`UbicacionActualRepository.updateAsync(${JSON.stringify(entity)})`);
    const id = entity.id;
    const previousEntity = await this.getByIdAsync(id);
    if (previousEntity == null) return 0;
    const sql = `UPDATE "UbicacionesActuales" SET id_dispositivo = $2, latitud = $3, longitud = $4, fecha_registro = $5 WHERE id = $1`;
    const values = [id, entity?.id_dispositivo ?? previousEntity.id_dispositivo, entity?.latitud ?? previousEntity.latitud, entity?.longitud ?? previousEntity.longitud, entity?.fecha_registro ?? previousEntity.fecha_registro];
    return await BD.execute(sql, values);
  };

  deleteByIdAsync = async (id) => {
    console.log(`UbicacionActualRepository.deleteByIdAsync(${id})`);
    const sql = `DELETE FROM "UbicacionesActuales" WHERE id = $1`;
    return await BD.execute(sql, [id]);
  };
}
