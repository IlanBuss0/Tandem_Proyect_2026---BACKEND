import BD from '../db/BD.js';

export default class CatalogoPermisoPertenecienteRepository {
  constructor() {
    console.log('Estoy en: CatalogoPermisoPertenecienteRepository.constructor()');
  }

  getAllAsync = async () => {
    console.log('CatalogoPermisoPertenecienteRepository.getAllAsync()');
    const sql = `SELECT id, nombre, orden FROM catalogo_permisos_pertenecientes ORDER BY id DESC`;
    return await BD.query(sql);
  };

  getByIdAsync = async (id) => {
    console.log(`CatalogoPermisoPertenecienteRepository.getByIdAsync(${id})`);
    const sql = `SELECT id, nombre, orden FROM catalogo_permisos_pertenecientes WHERE id = $1`;
    return await BD.queryOne(sql, [id]);
  };

  createAsync = async (entity) => {
    console.log(`CatalogoPermisoPertenecienteRepository.createAsync(${JSON.stringify(entity)})`);
    const sql = `INSERT INTO catalogo_permisos_pertenecientes (nombre, orden) VALUES ($1, $2) RETURNING id`;
    const values = [entity?.nombre ?? null, entity?.orden ?? null];
    const result = await BD.queryOne(sql, values);
    return result?.id ?? 0;
  };

  updateAsync = async (entity) => {
    console.log(`CatalogoPermisoPertenecienteRepository.updateAsync(${JSON.stringify(entity)})`);
    const id = entity.id;
    const previousEntity = await this.getByIdAsync(id);
    if (previousEntity == null) return 0;
    const sql = `UPDATE catalogo_permisos_pertenecientes SET nombre = $2, orden = $3 WHERE id = $1`;
    const values = [id, entity?.nombre ?? previousEntity.nombre, entity?.orden ?? previousEntity.orden];
    return await BD.execute(sql, values);
  };

  deleteByIdAsync = async (id) => {
    console.log(`CatalogoPermisoPertenecienteRepository.deleteByIdAsync(${id})`);
    const sql = `DELETE FROM catalogo_permisos_pertenecientes WHERE id = $1`;
    return await BD.execute(sql, [id]);
  };
}
