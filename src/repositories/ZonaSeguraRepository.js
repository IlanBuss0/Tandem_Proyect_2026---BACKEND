import BD from '../db/BD.js';

export default class ZonaSeguraRepository {
  constructor() {
    console.log('Estoy en: ZonaSeguraRepository.constructor()');
  }

  getAllAsync = async () => {
    console.log('ZonaSeguraRepository.getAllAsync()');
    const sql = `SELECT id, id_perteneciente, id_tutor_creador, nombre, latitud, longitud, radio_metro, notificar_entrada, notificar_salida, activa FROM zonas_seguras ORDER BY id DESC`;
    return await BD.query(sql);
  };

  getByIdAsync = async (id) => {
    console.log(`ZonaSeguraRepository.getByIdAsync(${id})`);
    const sql = `SELECT id, id_perteneciente, id_tutor_creador, nombre, latitud, longitud, radio_metro, notificar_entrada, notificar_salida, activa FROM zonas_seguras WHERE id = $1`;
    return await BD.queryOne(sql, [id]);
  };

  getByPertenecienteIdAsync = async (idPerteneciente) => {
    console.log(`ZonaSeguraRepository.getByPertenecienteIdAsync(${idPerteneciente})`);
    const sql = `SELECT id, id_perteneciente, id_tutor_creador, nombre, latitud, longitud, radio_metro, notificar_entrada, notificar_salida, activa FROM zonas_seguras WHERE id_perteneciente = $1 ORDER BY id DESC`;
    return await BD.query(sql, [idPerteneciente]);
  };

  createAsync = async (entity) => {
    console.log(`ZonaSeguraRepository.createAsync(${JSON.stringify(entity)})`);
    const sql = `
      INSERT INTO zonas_seguras (id_perteneciente, id_tutor_creador, nombre, latitud, longitud, radio_metro, notificar_entrada, notificar_salida, activa)
      VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, true), COALESCE($8, false), COALESCE($9, true))
      RETURNING id
    `;
    const values = [
      entity?.id_perteneciente,
      entity?.id_tutor_creador,
      entity?.nombre,
      entity?.latitud,
      entity?.longitud,
      entity?.radio_metro,
      entity?.notificar_entrada ?? true,
      entity?.notificar_salida ?? false,
      entity?.activa ?? true,
    ];
    const result = await BD.queryOne(sql, values);
    return result?.id ?? 0;
  };

  updateAsync = async (entity) => {
    console.log(`ZonaSeguraRepository.updateAsync(${JSON.stringify(entity)})`);
    const id = entity.id;
    const previousEntity = await this.getByIdAsync(id);
    if (previousEntity == null) return 0;
    const sql = `
      UPDATE zonas_seguras
      SET id_perteneciente = $2, id_tutor_creador = $3, nombre = $4, latitud = $5, longitud = $6, radio_metro = $7, notificar_entrada = $8, notificar_salida = $9, activa = $10
      WHERE id = $1
    `;
    const values = [
      id,
      entity?.id_perteneciente ?? previousEntity.id_perteneciente,
      entity?.id_tutor_creador ?? previousEntity.id_tutor_creador,
      entity?.nombre ?? previousEntity.nombre,
      entity?.latitud ?? previousEntity.latitud,
      entity?.longitud ?? previousEntity.longitud,
      entity?.radio_metro ?? previousEntity.radio_metro,
      entity?.notificar_entrada ?? previousEntity.notificar_entrada,
      entity?.notificar_salida ?? previousEntity.notificar_salida,
      entity?.activa ?? previousEntity.activa,
    ];
    return await BD.execute(sql, values);
  };

  deleteByIdAsync = async (id) => {
    console.log(`ZonaSeguraRepository.deleteByIdAsync(${id})`);
    const sql = `UPDATE zonas_seguras SET activa = false WHERE id = $1`;
    return await BD.execute(sql, [id]);
  };
}
