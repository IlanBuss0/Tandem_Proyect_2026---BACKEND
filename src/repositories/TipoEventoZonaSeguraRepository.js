import BD from '../db/BD.js';

export default class TipoEventoZonaSeguraRepository {
  constructor() {
    console.log('Estoy en: TipoEventoZonaSeguraRepository.constructor()');
  }

  getAllAsync = async () => {
    console.log('TipoEventoZonaSeguraRepository.getAllAsync()');
    const sql = `SELECT id, nombre, orden FROM tipos_eventos_zonas_seguras ORDER BY id DESC`;
    return await BD.query(sql);
  };

  getByIdAsync = async (id) => {
    console.log(`TipoEventoZonaSeguraRepository.getByIdAsync(${id})`);
    const sql = `SELECT id, nombre, orden FROM tipos_eventos_zonas_seguras WHERE id = $1`;
    return await BD.queryOne(sql, [id]);
  };

  createAsync = async (entity) => {
    console.log(`TipoEventoZonaSeguraRepository.createAsync(${JSON.stringify(entity)})`);
    const sql = `INSERT INTO tipos_eventos_zonas_seguras (nombre, orden) VALUES ($1, $2) RETURNING id`;
    const values = [entity?.nombre ?? null, entity?.orden ?? null];
    const result = await BD.queryOne(sql, values);
    return result?.id ?? 0;
  };

  updateAsync = async (entity) => {
    console.log(`TipoEventoZonaSeguraRepository.updateAsync(${JSON.stringify(entity)})`);
    const id = entity.id;
    const previousEntity = await this.getByIdAsync(id);
    if (previousEntity == null) return 0;
    const sql = `UPDATE tipos_eventos_zonas_seguras SET nombre = $2, orden = $3 WHERE id = $1`;
    const values = [id, entity?.nombre ?? previousEntity.nombre, entity?.orden ?? previousEntity.orden];
    return await BD.execute(sql, values);
  };

  deleteByIdAsync = async (id) => {
    console.log(`TipoEventoZonaSeguraRepository.deleteByIdAsync(${id})`);
    const sql = `DELETE FROM tipos_eventos_zonas_seguras WHERE id = $1`;
    return await BD.execute(sql, [id]);
  };
}
