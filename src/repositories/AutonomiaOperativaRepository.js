import BD from '../db/BD.js';

export default class AutonomiaOperativaRepository {
  constructor() {
    console.log('Estoy en: AutonomiaOperativaRepository.constructor()');
  }

  getAllAsync = async () => {
    console.log('AutonomiaOperativaRepository.getAllAsync()');
    const sql = `SELECT id, nombre, orden FROM autonomias_operativas ORDER BY id DESC`;
    return await BD.query(sql);
  };

  getByIdAsync = async (id) => {
    console.log(`AutonomiaOperativaRepository.getByIdAsync(${id})`);
    const sql = `SELECT id, nombre, orden FROM autonomias_operativas WHERE id = $1`;
    return await BD.queryOne(sql, [id]);
  };

  createAsync = async (entity) => {
    console.log(`AutonomiaOperativaRepository.createAsync(${JSON.stringify(entity)})`);
    const sql = `INSERT INTO autonomias_operativas (nombre, orden) VALUES ($1, $2) RETURNING id`;
    const values = [entity?.nombre ?? null, entity?.orden ?? null];
    const result = await BD.queryOne(sql, values);
    return result?.id ?? 0;
  };

  updateAsync = async (entity) => {
    console.log(`AutonomiaOperativaRepository.updateAsync(${JSON.stringify(entity)})`);
    const id = entity.id;
    const previousEntity = await this.getByIdAsync(id);
    if (previousEntity == null) return 0;
    const sql = `UPDATE autonomias_operativas SET nombre = $2, orden = $3 WHERE id = $1`;
    const values = [id, entity?.nombre ?? previousEntity.nombre, entity?.orden ?? previousEntity.orden];
    return await BD.execute(sql, values);
  };

  deleteByIdAsync = async (id) => {
    console.log(`AutonomiaOperativaRepository.deleteByIdAsync(${id})`);
    const sql = `DELETE FROM autonomias_operativas WHERE id = $1`;
    return await BD.execute(sql, [id]);
  };
}
