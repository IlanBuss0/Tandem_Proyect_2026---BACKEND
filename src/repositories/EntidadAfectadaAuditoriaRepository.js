import BD from '../db/BD.js';

export default class EntidadAfectadaAuditoriaRepository {
  constructor() {
    console.log('Estoy en: EntidadAfectadaAuditoriaRepository.constructor()');
  }

  getAllAsync = async () => {
    console.log('EntidadAfectadaAuditoriaRepository.getAllAsync()');
    const sql = `SELECT id, nombre, orden FROM entidades_afectadas_auditorias ORDER BY id DESC`;
    return await BD.query(sql);
  };

  getByIdAsync = async (id) => {
    console.log(`EntidadAfectadaAuditoriaRepository.getByIdAsync(${id})`);
    const sql = `SELECT id, nombre, orden FROM entidades_afectadas_auditorias WHERE id = $1`;
    return await BD.queryOne(sql, [id]);
  };

  createAsync = async (entity) => {
    console.log(`EntidadAfectadaAuditoriaRepository.createAsync(${JSON.stringify(entity)})`);
    const sql = `INSERT INTO entidades_afectadas_auditorias (nombre, orden) VALUES ($1, $2) RETURNING id`;
    const values = [entity?.nombre ?? null, entity?.orden ?? null];
    const result = await BD.queryOne(sql, values);
    return result?.id ?? 0;
  };

  updateAsync = async (entity) => {
    console.log(`EntidadAfectadaAuditoriaRepository.updateAsync(${JSON.stringify(entity)})`);
    const id = entity.id;
    const previousEntity = await this.getByIdAsync(id);
    if (previousEntity == null) return 0;
    const sql = `UPDATE entidades_afectadas_auditorias SET nombre = $2, orden = $3 WHERE id = $1`;
    const values = [id, entity?.nombre ?? previousEntity.nombre, entity?.orden ?? previousEntity.orden];
    return await BD.execute(sql, values);
  };

  deleteByIdAsync = async (id) => {
    console.log(`EntidadAfectadaAuditoriaRepository.deleteByIdAsync(${id})`);
    const sql = `DELETE FROM entidades_afectadas_auditorias WHERE id = $1`;
    return await BD.execute(sql, [id]);
  };
}
