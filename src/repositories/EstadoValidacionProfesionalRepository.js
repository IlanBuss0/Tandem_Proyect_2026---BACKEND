import BD from '../db/BD.js';

export default class EstadoValidacionProfesionalRepository {
  constructor() {
    console.log('Estoy en: EstadoValidacionProfesionalRepository.constructor()');
  }

  getAllAsync = async () => {
    console.log('EstadoValidacionProfesionalRepository.getAllAsync()');
    const sql = `SELECT id, nombre, orden FROM estados_validaciones_profesionales ORDER BY id DESC`;
    return await BD.query(sql);
  };

  getByIdAsync = async (id) => {
    console.log(`EstadoValidacionProfesionalRepository.getByIdAsync(${id})`);
    const sql = `SELECT id, nombre, orden FROM estados_validaciones_profesionales WHERE id = $1`;
    return await BD.queryOne(sql, [id]);
  };

  createAsync = async (entity) => {
    console.log(`EstadoValidacionProfesionalRepository.createAsync(${JSON.stringify(entity)})`);
    const sql = `INSERT INTO estados_validaciones_profesionales (nombre, orden) VALUES ($1, $2) RETURNING id`;
    const values = [entity?.nombre ?? null, entity?.orden ?? null];
    const result = await BD.queryOne(sql, values);
    return result?.id ?? 0;
  };

  updateAsync = async (entity) => {
    console.log(`EstadoValidacionProfesionalRepository.updateAsync(${JSON.stringify(entity)})`);
    const id = entity.id;
    const previousEntity = await this.getByIdAsync(id);
    if (previousEntity == null) return 0;
    const sql = `UPDATE estados_validaciones_profesionales SET nombre = $2, orden = $3 WHERE id = $1`;
    const values = [id, entity?.nombre ?? previousEntity.nombre, entity?.orden ?? previousEntity.orden];
    return await BD.execute(sql, values);
  };

  deleteByIdAsync = async (id) => {
    console.log(`EstadoValidacionProfesionalRepository.deleteByIdAsync(${id})`);
    const sql = `DELETE FROM estados_validaciones_profesionales WHERE id = $1`;
    return await BD.execute(sql, [id]);
  };
}
