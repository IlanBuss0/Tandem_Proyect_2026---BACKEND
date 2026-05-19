import BD from '../db/BD.js';

export default class PerfilProfesionalRepository {
  constructor() {
    console.log('Estoy en: PerfilProfesionalRepository.constructor()');
  }

  getAllAsync = async () => {
    console.log('PerfilProfesionalRepository.getAllAsync()');
    const sql = `SELECT id, id_profesional, descripcion, experiencia, precio_sesion, informacion_precio, visible_en_tienda FROM perfiles_profesionales ORDER BY id DESC`;
    return await BD.query(sql);
  };

  getByIdAsync = async (id) => {
    console.log(`PerfilProfesionalRepository.getByIdAsync(${id})`);
    const sql = `SELECT id, id_profesional, descripcion, experiencia, precio_sesion, informacion_precio, visible_en_tienda FROM perfiles_profesionales WHERE id = $1`;
    return await BD.queryOne(sql, [id]);
  };

  createAsync = async (entity) => {
    console.log(`PerfilProfesionalRepository.createAsync(${JSON.stringify(entity)})`);
    const sql = `INSERT INTO perfiles_profesionales (id_profesional, descripcion, experiencia, precio_sesion, informacion_precio, visible_en_tienda) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`;
    const values = [entity?.id_profesional ?? null, entity?.descripcion ?? null, entity?.experiencia ?? null, entity?.precio_sesion ?? null, entity?.informacion_precio ?? null, entity?.visible_en_tienda ?? null];
    const result = await BD.queryOne(sql, values);
    return result?.id ?? 0;
  };

  updateAsync = async (entity) => {
    console.log(`PerfilProfesionalRepository.updateAsync(${JSON.stringify(entity)})`);
    const id = entity.id;
    const previousEntity = await this.getByIdAsync(id);
    if (previousEntity == null) return 0;
    const sql = `UPDATE perfiles_profesionales SET id_profesional = $2, descripcion = $3, experiencia = $4, precio_sesion = $5, informacion_precio = $6, visible_en_tienda = $7 WHERE id = $1`;
    const values = [id, entity?.id_profesional ?? previousEntity.id_profesional, entity?.descripcion ?? previousEntity.descripcion, entity?.experiencia ?? previousEntity.experiencia, entity?.precio_sesion ?? previousEntity.precio_sesion, entity?.informacion_precio ?? previousEntity.informacion_precio, entity?.visible_en_tienda ?? previousEntity.visible_en_tienda];
    return await BD.execute(sql, values);
  };

  deleteByIdAsync = async (id) => {
    console.log(`PerfilProfesionalRepository.deleteByIdAsync(${id})`);
    const sql = `DELETE FROM perfiles_profesionales WHERE id = $1`;
    return await BD.execute(sql, [id]);
  };
}
