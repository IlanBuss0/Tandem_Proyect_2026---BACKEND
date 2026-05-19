import BD from '../db/BD.js';

export default class DificultadActividadRepository {
  constructor() {
    console.log('Estoy en: DificultadActividadRepository.constructor()');
  }

  getAllAsync = async () => {
    console.log('DificultadActividadRepository.getAllAsync()');
    const sql = `SELECT id, nombre, orden FROM dificultades_actividades ORDER BY id DESC`;
    return await BD.query(sql);
  };

  getByIdAsync = async (id) => {
    console.log(`DificultadActividadRepository.getByIdAsync(${id})`);
    const sql = `SELECT id, nombre, orden FROM dificultades_actividades WHERE id = $1`;
    return await BD.queryOne(sql, [id]);
  };

  createAsync = async (entity) => {
    console.log(`DificultadActividadRepository.createAsync(${JSON.stringify(entity)})`);
    const sql = `INSERT INTO dificultades_actividades (nombre, orden) VALUES ($1, $2) RETURNING id`;
    const values = [entity?.nombre ?? null, entity?.orden ?? null];
    const result = await BD.queryOne(sql, values);
    return result?.id ?? 0;
  };

  updateAsync = async (entity) => {
    console.log(`DificultadActividadRepository.updateAsync(${JSON.stringify(entity)})`);
    const id = entity.id;
    const previousEntity = await this.getByIdAsync(id);
    if (previousEntity == null) return 0;
    const sql = `UPDATE dificultades_actividades SET nombre = $2, orden = $3 WHERE id = $1`;
    const values = [id, entity?.nombre ?? previousEntity.nombre, entity?.orden ?? previousEntity.orden];
    return await BD.execute(sql, values);
  };

  deleteByIdAsync = async (id) => {
    console.log(`DificultadActividadRepository.deleteByIdAsync(${id})`);
    const sql = `DELETE FROM dificultades_actividades WHERE id = $1`;
    return await BD.execute(sql, [id]);
  };
}
