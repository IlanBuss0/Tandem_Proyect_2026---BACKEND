import BD from '../db/BD.js';

export default class ArchivoRepository {
  constructor() {
    console.log('Estoy en: ArchivoRepository.constructor()');
  }

  getAllAsync = async () => {
    console.log('ArchivoRepository.getAllAsync()');
    const sql = `SELECT id, id_usuario_creador, id_tipo_archivo, nombre_archivo, url, fecha_subida, activo FROM archivos ORDER BY id DESC`;
    return await BD.query(sql);
  };

  getByIdAsync = async (id) => {
    console.log(`ArchivoRepository.getByIdAsync(${id})`);
    const sql = `SELECT id, id_usuario_creador, id_tipo_archivo, nombre_archivo, url, fecha_subida, activo FROM archivos WHERE id = $1`;
    return await BD.queryOne(sql, [id]);
  };

  createAsync = async (entity) => {
    console.log(`ArchivoRepository.createAsync(${JSON.stringify(entity)})`);
    const sql = `INSERT INTO archivos (id_usuario_creador, id_tipo_archivo, nombre_archivo, url, fecha_subida, activo) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`;
    const values = [entity?.id_usuario_creador ?? null, entity?.id_tipo_archivo ?? null, entity?.nombre_archivo ?? null, entity?.url ?? null, entity?.fecha_subida ?? null, entity?.activo ?? null];
    const result = await BD.queryOne(sql, values);
    return result?.id ?? 0;
  };

  updateAsync = async (entity) => {
    console.log(`ArchivoRepository.updateAsync(${JSON.stringify(entity)})`);
    const id = entity.id;
    const previousEntity = await this.getByIdAsync(id);
    if (previousEntity == null) return 0;
    const sql = `UPDATE archivos SET id_usuario_creador = $2, id_tipo_archivo = $3, nombre_archivo = $4, url = $5, fecha_subida = $6, activo = $7 WHERE id = $1`;
    const values = [id, entity?.id_usuario_creador ?? previousEntity.id_usuario_creador, entity?.id_tipo_archivo ?? previousEntity.id_tipo_archivo, entity?.nombre_archivo ?? previousEntity.nombre_archivo, entity?.url ?? previousEntity.url, entity?.fecha_subida ?? previousEntity.fecha_subida, entity?.activo ?? previousEntity.activo];
    return await BD.execute(sql, values);
  };

  deleteByIdAsync = async (id) => {
    console.log(`ArchivoRepository.deleteByIdAsync(${id})`);
    const sql = `DELETE FROM archivos WHERE id = $1`;
    return await BD.execute(sql, [id]);
  };
}
