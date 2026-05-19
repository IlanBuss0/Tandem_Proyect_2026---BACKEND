import BD from '../db/BD.js';

export default class TipoPermisoArchivoRepository {
  constructor() {
    console.log('Estoy en: TipoPermisoArchivoRepository.constructor()');
  }

  getAllAsync = async () => {
    console.log('TipoPermisoArchivoRepository.getAllAsync()');
    const sql = `SELECT id, nombre, orden FROM tipos_permisos_archivos ORDER BY id DESC`;
    return await BD.query(sql);
  };

  getByIdAsync = async (id) => {
    console.log(`TipoPermisoArchivoRepository.getByIdAsync(${id})`);
    const sql = `SELECT id, nombre, orden FROM tipos_permisos_archivos WHERE id = $1`;
    return await BD.queryOne(sql, [id]);
  };

  createAsync = async (entity) => {
    console.log(`TipoPermisoArchivoRepository.createAsync(${JSON.stringify(entity)})`);
    const sql = `INSERT INTO tipos_permisos_archivos (nombre, orden) VALUES ($1, $2) RETURNING id`;
    const values = [entity?.nombre ?? null, entity?.orden ?? null];
    const result = await BD.queryOne(sql, values);
    return result?.id ?? 0;
  };

  updateAsync = async (entity) => {
    console.log(`TipoPermisoArchivoRepository.updateAsync(${JSON.stringify(entity)})`);
    const id = entity.id;
    const previousEntity = await this.getByIdAsync(id);
    if (previousEntity == null) return 0;
    const sql = `UPDATE tipos_permisos_archivos SET nombre = $2, orden = $3 WHERE id = $1`;
    const values = [id, entity?.nombre ?? previousEntity.nombre, entity?.orden ?? previousEntity.orden];
    return await BD.execute(sql, values);
  };

  deleteByIdAsync = async (id) => {
    console.log(`TipoPermisoArchivoRepository.deleteByIdAsync(${id})`);
    const sql = `DELETE FROM tipos_permisos_archivos WHERE id = $1`;
    return await BD.execute(sql, [id]);
  };
}
