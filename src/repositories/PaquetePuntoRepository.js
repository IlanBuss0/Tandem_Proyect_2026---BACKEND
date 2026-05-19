import BD from '../db/BD.js';

export default class PaquetePuntoRepository {
  constructor() {
    console.log('Estoy en: PaquetePuntoRepository.constructor()');
  }

  getAllAsync = async () => {
    console.log('PaquetePuntoRepository.getAllAsync()');
    const sql = `SELECT id, nombre, cantidad_punto, precio, activo FROM paquetes_puntos ORDER BY id DESC`;
    return await BD.query(sql);
  };

  getByIdAsync = async (id) => {
    console.log(`PaquetePuntoRepository.getByIdAsync(${id})`);
    const sql = `SELECT id, nombre, cantidad_punto, precio, activo FROM paquetes_puntos WHERE id = $1`;
    return await BD.queryOne(sql, [id]);
  };

  createAsync = async (entity) => {
    console.log(`PaquetePuntoRepository.createAsync(${JSON.stringify(entity)})`);
    const sql = `INSERT INTO paquetes_puntos (nombre, cantidad_punto, precio, activo) VALUES ($1, $2, $3, $4) RETURNING id`;
    const values = [entity?.nombre ?? null, entity?.cantidad_punto ?? null, entity?.precio ?? null, entity?.activo ?? null];
    const result = await BD.queryOne(sql, values);
    return result?.id ?? 0;
  };

  updateAsync = async (entity) => {
    console.log(`PaquetePuntoRepository.updateAsync(${JSON.stringify(entity)})`);
    const id = entity.id;
    const previousEntity = await this.getByIdAsync(id);
    if (previousEntity == null) return 0;
    const sql = `UPDATE paquetes_puntos SET nombre = $2, cantidad_punto = $3, precio = $4, activo = $5 WHERE id = $1`;
    const values = [id, entity?.nombre ?? previousEntity.nombre, entity?.cantidad_punto ?? previousEntity.cantidad_punto, entity?.precio ?? previousEntity.precio, entity?.activo ?? previousEntity.activo];
    return await BD.execute(sql, values);
  };

  deleteByIdAsync = async (id) => {
    console.log(`PaquetePuntoRepository.deleteByIdAsync(${id})`);
    const sql = `DELETE FROM paquetes_puntos WHERE id = $1`;
    return await BD.execute(sql, [id]);
  };
}
