import BD from '../db/BD.js';

export default class ReporteUsuarioRepository {
  constructor() {
    console.log('Estoy en: ReporteUsuarioRepository.constructor()');
  }

  getAllAsync = async () => {
    console.log('ReporteUsuarioRepository.getAllAsync()');
    const sql = `SELECT id, id_usuario_reportante, id_usuario_reportado, id_mensaje, id_archivo, id_estado_reporte, motivo, detalle, fecha_reporte FROM "ReportesUsuarios" ORDER BY id DESC`;
    return await BD.query(sql);
  };

  getByIdAsync = async (id) => {
    console.log(`ReporteUsuarioRepository.getByIdAsync(${id})`);
    const sql = `SELECT id, id_usuario_reportante, id_usuario_reportado, id_mensaje, id_archivo, id_estado_reporte, motivo, detalle, fecha_reporte FROM "ReportesUsuarios" WHERE id = $1`;
    return await BD.queryOne(sql, [id]);
  };

  createAsync = async (entity) => {
    console.log(`ReporteUsuarioRepository.createAsync(${JSON.stringify(entity)})`);
    const sql = `INSERT INTO "ReportesUsuarios" (id_usuario_reportante, id_usuario_reportado, id_mensaje, id_archivo, id_estado_reporte, motivo, detalle, fecha_reporte) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`;
    const values = [entity?.id_usuario_reportante, entity?.id_usuario_reportado ?? null, entity?.id_mensaje ?? null, entity?.id_archivo ?? null, entity?.id_estado_reporte, entity?.motivo, entity?.detalle ?? null, entity?.fecha_reporte];
    const result = await BD.queryOne(sql, values);
    return result?.id ?? 0;
  };

  updateAsync = async (entity) => {
    console.log(`ReporteUsuarioRepository.updateAsync(${JSON.stringify(entity)})`);
    const id = entity.id;
    const previousEntity = await this.getByIdAsync(id);
    if (previousEntity == null) return 0;
    const sql = `UPDATE "ReportesUsuarios" SET id_usuario_reportante = $2, id_usuario_reportado = $3, id_mensaje = $4, id_archivo = $5, id_estado_reporte = $6, motivo = $7, detalle = $8, fecha_reporte = $9 WHERE id = $1`;
    const values = [id, entity?.id_usuario_reportante ?? previousEntity.id_usuario_reportante, entity?.id_usuario_reportado ?? previousEntity.id_usuario_reportado, entity?.id_mensaje ?? previousEntity.id_mensaje, entity?.id_archivo ?? previousEntity.id_archivo, entity?.id_estado_reporte ?? previousEntity.id_estado_reporte, entity?.motivo ?? previousEntity.motivo, entity?.detalle ?? previousEntity.detalle, entity?.fecha_reporte ?? previousEntity.fecha_reporte];
    return await BD.execute(sql, values);
  };

  deleteByIdAsync = async (id) => {
    console.log(`ReporteUsuarioRepository.deleteByIdAsync(${id})`);
    const sql = `DELETE FROM "ReportesUsuarios" WHERE id = $1`;
    return await BD.execute(sql, [id]);
  };
}
