import BD from '../db/BD.js';

export default class ConfiguracionAccesibilidadRepository {
  constructor() {
    console.log('Estoy en: ConfiguracionAccesibilidadRepository.constructor()');
  }

  getAllAsync = async () => {
    console.log('ConfiguracionAccesibilidadRepository.getAllAsync()');
    const sql = `SELECT id, id_usuario, clave, valor, fecha_modificacion FROM "ConfiguracionesAccesibilidad" ORDER BY id DESC`;
    return await BD.query(sql);
  };

  getByIdAsync = async (id) => {
    console.log(`ConfiguracionAccesibilidadRepository.getByIdAsync(${id})`);
    const sql = `SELECT id, id_usuario, clave, valor, fecha_modificacion FROM "ConfiguracionesAccesibilidad" WHERE id = $1`;
    return await BD.queryOne(sql, [id]);
  };

  getByUsuarioIdAsync = async (idUsuario) => {
    console.log(`ConfiguracionAccesibilidadRepository.getByUsuarioIdAsync(${idUsuario})`);
    const sql = `SELECT id, id_usuario, clave, valor, fecha_modificacion FROM "ConfiguracionesAccesibilidad" WHERE id_usuario = $1 ORDER BY clave ASC`;
    return await BD.query(sql, [idUsuario]);
  };

  getByUsuarioAndClaveAsync = async (idUsuario, clave) => {
    console.log(`ConfiguracionAccesibilidadRepository.getByUsuarioAndClaveAsync(${idUsuario}, ${clave})`);
    const sql = `SELECT id, id_usuario, clave, valor, fecha_modificacion FROM "ConfiguracionesAccesibilidad" WHERE id_usuario = $1 AND clave = $2`;
    return await BD.queryOne(sql, [idUsuario, clave]);
  };

  createAsync = async (entity) => {
    console.log(`ConfiguracionAccesibilidadRepository.createAsync(${JSON.stringify(entity)})`);
    const sql = `INSERT INTO "ConfiguracionesAccesibilidad" (id_usuario, clave, valor, fecha_modificacion) VALUES ($1, $2, $3, $4) RETURNING id`;
    const values = [entity?.id_usuario, entity?.clave, entity?.valor, entity?.fecha_modificacion];
    const result = await BD.queryOne(sql, values);
    return result?.id ?? 0;
  };

  updateAsync = async (entity) => {
    console.log(`ConfiguracionAccesibilidadRepository.updateAsync(${JSON.stringify(entity)})`);
    const id = entity.id;
    const previousEntity = await this.getByIdAsync(id);
    if (previousEntity == null) return 0;
    const sql = `UPDATE "ConfiguracionesAccesibilidad" SET id_usuario = $2, clave = $3, valor = $4, fecha_modificacion = $5 WHERE id = $1`;
    const values = [id, entity?.id_usuario ?? previousEntity.id_usuario, entity?.clave ?? previousEntity.clave, entity?.valor ?? previousEntity.valor, entity?.fecha_modificacion ?? previousEntity.fecha_modificacion];
    return await BD.execute(sql, values);
  };

  deleteByIdAsync = async (id) => {
    console.log(`ConfiguracionAccesibilidadRepository.deleteByIdAsync(${id})`);
    const sql = `DELETE FROM "ConfiguracionesAccesibilidad" WHERE id = $1`;
    return await BD.execute(sql, [id]);
  };
}
