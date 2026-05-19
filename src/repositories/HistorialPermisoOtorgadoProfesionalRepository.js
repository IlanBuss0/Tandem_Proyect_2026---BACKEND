import BD from '../db/BD.js';

export default class HistorialPermisoOtorgadoProfesionalRepository {
  constructor() {
    console.log('Estoy en: HistorialPermisoOtorgadoProfesionalRepository.constructor()');
  }

  getAllAsync = async () => {
    console.log('HistorialPermisoOtorgadoProfesionalRepository.getAllAsync()');
    const sql = `SELECT id, id_vinculo_profesional_perteneciente, id_permiso_profesional, habilitado_anterior, habilitado_nuevo, id_usuario_modificador, motivo, fecha_modificacion FROM historial_permisos_otorgados_profesionales ORDER BY id DESC`;
    return await BD.query(sql);
  };

  getByIdAsync = async (id) => {
    console.log(`HistorialPermisoOtorgadoProfesionalRepository.getByIdAsync(${id})`);
    const sql = `SELECT id, id_vinculo_profesional_perteneciente, id_permiso_profesional, habilitado_anterior, habilitado_nuevo, id_usuario_modificador, motivo, fecha_modificacion FROM historial_permisos_otorgados_profesionales WHERE id = $1`;
    return await BD.queryOne(sql, [id]);
  };

  createAsync = async (entity) => {
    console.log(`HistorialPermisoOtorgadoProfesionalRepository.createAsync(${JSON.stringify(entity)})`);
    const sql = `INSERT INTO historial_permisos_otorgados_profesionales (id_vinculo_profesional_perteneciente, id_permiso_profesional, habilitado_anterior, habilitado_nuevo, id_usuario_modificador, motivo, fecha_modificacion) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`;
    const values = [entity?.id_vinculo_profesional_perteneciente ?? null, entity?.id_permiso_profesional ?? null, entity?.habilitado_anterior ?? null, entity?.habilitado_nuevo ?? null, entity?.id_usuario_modificador ?? null, entity?.motivo ?? null, entity?.fecha_modificacion ?? null];
    const result = await BD.queryOne(sql, values);
    return result?.id ?? 0;
  };

  updateAsync = async (entity) => {
    console.log(`HistorialPermisoOtorgadoProfesionalRepository.updateAsync(${JSON.stringify(entity)})`);
    const id = entity.id;
    const previousEntity = await this.getByIdAsync(id);
    if (previousEntity == null) return 0;
    const sql = `UPDATE historial_permisos_otorgados_profesionales SET id_vinculo_profesional_perteneciente = $2, id_permiso_profesional = $3, habilitado_anterior = $4, habilitado_nuevo = $5, id_usuario_modificador = $6, motivo = $7, fecha_modificacion = $8 WHERE id = $1`;
    const values = [id, entity?.id_vinculo_profesional_perteneciente ?? previousEntity.id_vinculo_profesional_perteneciente, entity?.id_permiso_profesional ?? previousEntity.id_permiso_profesional, entity?.habilitado_anterior ?? previousEntity.habilitado_anterior, entity?.habilitado_nuevo ?? previousEntity.habilitado_nuevo, entity?.id_usuario_modificador ?? previousEntity.id_usuario_modificador, entity?.motivo ?? previousEntity.motivo, entity?.fecha_modificacion ?? previousEntity.fecha_modificacion];
    return await BD.execute(sql, values);
  };

  deleteByIdAsync = async (id) => {
    console.log(`HistorialPermisoOtorgadoProfesionalRepository.deleteByIdAsync(${id})`);
    const sql = `DELETE FROM historial_permisos_otorgados_profesionales WHERE id = $1`;
    return await BD.execute(sql, [id]);
  };
}
