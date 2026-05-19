import BD from '../db/BD.js';

export default class CatalogoPermisoProfesionalRepository {
  constructor() {
    console.log('Estoy en: CatalogoPermisoProfesionalRepository.constructor()');
  }

  getAllAsync = async () => {
    console.log('CatalogoPermisoProfesionalRepository.getAllAsync()');
    const sql = `SELECT id, nombre, orden FROM catalogo_permisos_profesionales ORDER BY id DESC`;
    return await BD.query(sql);
  };

  getByIdAsync = async (id) => {
    console.log(`CatalogoPermisoProfesionalRepository.getByIdAsync(${id})`);
    const sql = `SELECT id, nombre, orden FROM catalogo_permisos_profesionales WHERE id = $1`;
    return await BD.queryOne(sql, [id]);
  };

  createAsync = async (entity) => {
    console.log(`CatalogoPermisoProfesionalRepository.createAsync(${JSON.stringify(entity)})`);
    const sql = `INSERT INTO catalogo_permisos_profesionales (nombre, orden) VALUES ($1, $2) RETURNING id`;
    const values = [entity?.nombre ?? null, entity?.orden ?? null];
    const result = await BD.queryOne(sql, values);
    return result?.id ?? 0;
  };

  updateAsync = async (entity) => {
    console.log(`CatalogoPermisoProfesionalRepository.updateAsync(${JSON.stringify(entity)})`);
    const id = entity.id;
    const previousEntity = await this.getByIdAsync(id);
    if (previousEntity == null) return 0;
    const sql = `UPDATE catalogo_permisos_profesionales SET nombre = $2, orden = $3 WHERE id = $1`;
    const values = [id, entity?.nombre ?? previousEntity.nombre, entity?.orden ?? previousEntity.orden];
    return await BD.execute(sql, values);
  };

  deleteByIdAsync = async (id) => {
    console.log(`CatalogoPermisoProfesionalRepository.deleteByIdAsync(${id})`);
    const sql = `DELETE FROM catalogo_permisos_profesionales WHERE id = $1`;
    return await BD.execute(sql, [id]);
  };
}
