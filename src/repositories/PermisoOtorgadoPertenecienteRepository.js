import BD from '../db/BD.js';

export default class PermisoOtorgadoPertenecienteRepository {
  constructor() {
    console.log('Estoy en: PermisoOtorgadoPertenecienteRepository.constructor()');
  }

  getAllAsync = async () => {
    console.log('PermisoOtorgadoPertenecienteRepository.getAllAsync()');
    const sql = `SELECT id, id_perteneciente, id_permiso_perteneciente, habilitado, id_usuario_modificador, fecha_modificacion FROM permisos_otorgados_pertenecientes ORDER BY id DESC`;
    return await BD.query(sql);
  };

  getByIdAsync = async (id) => {
    console.log(`PermisoOtorgadoPertenecienteRepository.getByIdAsync(${id})`);
    const sql = `SELECT id, id_perteneciente, id_permiso_perteneciente, habilitado, id_usuario_modificador, fecha_modificacion FROM permisos_otorgados_pertenecientes WHERE id = $1`;
    return await BD.queryOne(sql, [id]);
  };

  createAsync = async (entity) => {
    console.log(`PermisoOtorgadoPertenecienteRepository.createAsync(${JSON.stringify(entity)})`);
    const sql = `INSERT INTO permisos_otorgados_pertenecientes (id_perteneciente, id_permiso_perteneciente, habilitado, id_usuario_modificador, fecha_modificacion) VALUES ($1, $2, $3, $4, $5) RETURNING id`;
    const values = [entity?.id_perteneciente ?? null, entity?.id_permiso_perteneciente ?? null, entity?.habilitado ?? null, entity?.id_usuario_modificador ?? null, entity?.fecha_modificacion ?? null];
    const result = await BD.queryOne(sql, values);
    return result?.id ?? 0;
  };

  updateAsync = async (entity) => {
    console.log(`PermisoOtorgadoPertenecienteRepository.updateAsync(${JSON.stringify(entity)})`);
    const id = entity.id;
    const previousEntity = await this.getByIdAsync(id);
    if (previousEntity == null) return 0;
    const sql = `UPDATE permisos_otorgados_pertenecientes SET id_perteneciente = $2, id_permiso_perteneciente = $3, habilitado = $4, id_usuario_modificador = $5, fecha_modificacion = $6 WHERE id = $1`;
    const values = [id, entity?.id_perteneciente ?? previousEntity.id_perteneciente, entity?.id_permiso_perteneciente ?? previousEntity.id_permiso_perteneciente, entity?.habilitado ?? previousEntity.habilitado, entity?.id_usuario_modificador ?? previousEntity.id_usuario_modificador, entity?.fecha_modificacion ?? previousEntity.fecha_modificacion];
    return await BD.execute(sql, values);
  };

  deleteByIdAsync = async (id) => {
    console.log(`PermisoOtorgadoPertenecienteRepository.deleteByIdAsync(${id})`);
    const sql = `DELETE FROM permisos_otorgados_pertenecientes WHERE id = $1`;
    return await BD.execute(sql, [id]);
  };
}
