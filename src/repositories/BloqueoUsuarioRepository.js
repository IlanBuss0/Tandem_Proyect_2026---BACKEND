import BD from '../db/BD.js';

export default class BloqueoUsuarioRepository {
  constructor() {
    console.log('Estoy en: BloqueoUsuarioRepository.constructor()');
  }

  getAllAsync = async () => {
    console.log('BloqueoUsuarioRepository.getAllAsync()');
    const sql = `SELECT id, id_usuario_bloqueador, id_usuario_bloqueado, motivo, activo, fecha_bloqueo FROM bloqueos_usuarios ORDER BY id DESC`;
    return await BD.query(sql);
  };

  getByIdAsync = async (id) => {
    console.log(`BloqueoUsuarioRepository.getByIdAsync(${id})`);
    const sql = `SELECT id, id_usuario_bloqueador, id_usuario_bloqueado, motivo, activo, fecha_bloqueo FROM bloqueos_usuarios WHERE id = $1`;
    return await BD.queryOne(sql, [id]);
  };

  getByParejaAsync = async (idBloqueador, idBloqueado) => {
    console.log(`BloqueoUsuarioRepository.getByParejaAsync(${idBloqueador}, ${idBloqueado})`);
    const sql = `SELECT id, id_usuario_bloqueador, id_usuario_bloqueado, motivo, activo, fecha_bloqueo FROM bloqueos_usuarios WHERE id_usuario_bloqueador = $1 AND id_usuario_bloqueado = $2`;
    return await BD.queryOne(sql, [idBloqueador, idBloqueado]);
  };

  createAsync = async (entity) => {
    console.log(`BloqueoUsuarioRepository.createAsync(${JSON.stringify(entity)})`);
    const sql = `INSERT INTO bloqueos_usuarios (id_usuario_bloqueador, id_usuario_bloqueado, motivo, activo, fecha_bloqueo) VALUES ($1, $2, $3, COALESCE($4, true), $5) RETURNING id`;
    const values = [entity?.id_usuario_bloqueador, entity?.id_usuario_bloqueado, entity?.motivo ?? null, entity?.activo ?? true, entity?.fecha_bloqueo];
    const result = await BD.queryOne(sql, values);
    return result?.id ?? 0;
  };

  updateAsync = async (entity) => {
    console.log(`BloqueoUsuarioRepository.updateAsync(${JSON.stringify(entity)})`);
    const id = entity.id;
    const previousEntity = await this.getByIdAsync(id);
    if (previousEntity == null) return 0;
    const sql = `UPDATE bloqueos_usuarios SET id_usuario_bloqueador = $2, id_usuario_bloqueado = $3, motivo = $4, activo = $5, fecha_bloqueo = $6 WHERE id = $1`;
    const values = [id, entity?.id_usuario_bloqueador ?? previousEntity.id_usuario_bloqueador, entity?.id_usuario_bloqueado ?? previousEntity.id_usuario_bloqueado, entity?.motivo ?? previousEntity.motivo, entity?.activo ?? previousEntity.activo, entity?.fecha_bloqueo ?? previousEntity.fecha_bloqueo];
    return await BD.execute(sql, values);
  };

  deleteByIdAsync = async (id) => {
    console.log(`BloqueoUsuarioRepository.deleteByIdAsync(${id})`);
    const sql = `UPDATE bloqueos_usuarios SET activo = false WHERE id = $1`;
    return await BD.execute(sql, [id]);
  };
}
