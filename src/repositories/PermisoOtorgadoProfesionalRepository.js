import BD from '../db/BD.js';

export default class PermisoOtorgadoProfesionalRepository {
  constructor() {
    console.log('Estoy en: PermisoOtorgadoProfesionalRepository.constructor()');
  }

  getAllAsync = async () => {
    console.log('PermisoOtorgadoProfesionalRepository.getAllAsync()');
    const sql = `SELECT id, id_vinculo_profesional_perteneciente, id_permiso_profesional, habilitado, id_usuario_modificador, fecha_modificacion FROM permisos_otorgados_profesionales ORDER BY id DESC`;
    return await BD.query(sql);
  };

  getByIdAsync = async (id) => {
    console.log(`PermisoOtorgadoProfesionalRepository.getByIdAsync(${id})`);
    const sql = `SELECT id, id_vinculo_profesional_perteneciente, id_permiso_profesional, habilitado, id_usuario_modificador, fecha_modificacion FROM permisos_otorgados_profesionales WHERE id = $1`;
    return await BD.queryOne(sql, [id]);
  };

  createAsync = async (entity) => {
    console.log(`PermisoOtorgadoProfesionalRepository.createAsync(${JSON.stringify(entity)})`);
    const sql = `INSERT INTO permisos_otorgados_profesionales (id_vinculo_profesional_perteneciente, id_permiso_profesional, habilitado, id_usuario_modificador, fecha_modificacion) VALUES ($1, $2, $3, $4, $5) RETURNING id`;
    const values = [entity?.id_vinculo_profesional_perteneciente ?? null, entity?.id_permiso_profesional ?? null, entity?.habilitado ?? null, entity?.id_usuario_modificador ?? null, entity?.fecha_modificacion ?? null];
    const result = await BD.queryOne(sql, values);
    return result?.id ?? 0;
  };

  updateAsync = async (entity) => {
    console.log(`PermisoOtorgadoProfesionalRepository.updateAsync(${JSON.stringify(entity)})`);
    const id = entity.id;
    const previousEntity = await this.getByIdAsync(id);
    if (previousEntity == null) return 0;
    const sql = `UPDATE permisos_otorgados_profesionales SET id_vinculo_profesional_perteneciente = $2, id_permiso_profesional = $3, habilitado = $4, id_usuario_modificador = $5, fecha_modificacion = $6 WHERE id = $1`;
    const values = [id, entity?.id_vinculo_profesional_perteneciente ?? previousEntity.id_vinculo_profesional_perteneciente, entity?.id_permiso_profesional ?? previousEntity.id_permiso_profesional, entity?.habilitado ?? previousEntity.habilitado, entity?.id_usuario_modificador ?? previousEntity.id_usuario_modificador, entity?.fecha_modificacion ?? previousEntity.fecha_modificacion];
    return await BD.execute(sql, values);
  };

  deleteByIdAsync = async (id) => {
    console.log(`PermisoOtorgadoProfesionalRepository.deleteByIdAsync(${id})`);
    const sql = `DELETE FROM permisos_otorgados_profesionales WHERE id = $1`;
    return await BD.execute(sql, [id]);
  };
}
