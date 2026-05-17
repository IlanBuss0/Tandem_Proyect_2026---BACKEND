import BD from '../db/BD.js';

export default class DispositivoRepository {
  constructor() {
    console.log('Estoy en: DispositivoRepository.constructor()');
  }

  getAllAsync = async () => {
    console.log('DispositivoRepository.getAllAsync()');
    const sql = `SELECT id, id_usuario, nombre, identificador_dispositivo, activo, fecha_alta FROM dispositivos ORDER BY id DESC`;
    return await BD.query(sql);
  };

  getByIdAsync = async (id) => {
    console.log(`DispositivoRepository.getByIdAsync(${id})`);
    const sql = `SELECT id, id_usuario, nombre, identificador_dispositivo, activo, fecha_alta FROM dispositivos WHERE id = $1`;
    return await BD.queryOne(sql, [id]);
  };

  getByUsuarioIdAsync = async (idUsuario) => {
    console.log(`DispositivoRepository.getByUsuarioIdAsync(${idUsuario})`);
    const sql = `SELECT id, id_usuario, nombre, identificador_dispositivo, activo, fecha_alta FROM dispositivos WHERE id_usuario = $1 ORDER BY id DESC`;
    return await BD.query(sql, [idUsuario]);
  };

  createAsync = async (entity) => {
    console.log(`DispositivoRepository.createAsync(${JSON.stringify(entity)})`);
    const sql = `INSERT INTO dispositivos (id_usuario, nombre, identificador_dispositivo, activo, fecha_alta) VALUES ($1, $2, $3, COALESCE($4, true), $5) RETURNING id`;
    const values = [entity?.id_usuario, entity?.nombre ?? null, entity?.identificador_dispositivo ?? null, entity?.activo ?? true, entity?.fecha_alta];
    const result = await BD.queryOne(sql, values);
    return result?.id ?? 0;
  };

  updateAsync = async (entity) => {
    console.log(`DispositivoRepository.updateAsync(${JSON.stringify(entity)})`);
    const id = entity.id;
    const previousEntity = await this.getByIdAsync(id);
    if (previousEntity == null) return 0;
    const sql = `UPDATE dispositivos SET id_usuario = $2, nombre = $3, identificador_dispositivo = $4, activo = $5, fecha_alta = $6 WHERE id = $1`;
    const values = [id, entity?.id_usuario ?? previousEntity.id_usuario, entity?.nombre ?? previousEntity.nombre, entity?.identificador_dispositivo ?? previousEntity.identificador_dispositivo, entity?.activo ?? previousEntity.activo, entity?.fecha_alta ?? previousEntity.fecha_alta];
    return await BD.execute(sql, values);
  };

  deleteByIdAsync = async (id) => {
    console.log(`DispositivoRepository.deleteByIdAsync(${id})`);
    const sql = `UPDATE dispositivos SET activo = false WHERE id = $1`;
    return await BD.execute(sql, [id]);
  };
}
