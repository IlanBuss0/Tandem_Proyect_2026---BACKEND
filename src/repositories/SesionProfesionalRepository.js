import BD from '../db/BD.js';

export default class SesionProfesionalRepository {
  constructor() {
    console.log('Estoy en: SesionProfesionalRepository.constructor()');
  }

  getAllAsync = async () => {
    console.log('SesionProfesionalRepository.getAllAsync()');
    const sql = `SELECT id, id_profesional, id_perteneciente, fecha_sesion, nota_sesion, recomendacion FROM sesiones_profesionales ORDER BY id DESC`;
    return await BD.query(sql);
  };

  getByIdAsync = async (id) => {
    console.log(`SesionProfesionalRepository.getByIdAsync(${id})`);
    const sql = `SELECT id, id_profesional, id_perteneciente, fecha_sesion, nota_sesion, recomendacion FROM sesiones_profesionales WHERE id = $1`;
    return await BD.queryOne(sql, [id]);
  };

  getByPertenecienteIdAsync = async (idPerteneciente) => {
    console.log(`SesionProfesionalRepository.getByPertenecienteIdAsync(${idPerteneciente})`);
    const sql = `SELECT id, id_profesional, id_perteneciente, fecha_sesion, nota_sesion, recomendacion FROM sesiones_profesionales WHERE id_perteneciente = $1 ORDER BY id DESC`;
    return await BD.query(sql, [idPerteneciente]);
  };

  getByProfesionalIdAsync = async (idProfesional) => {
    console.log(`SesionProfesionalRepository.getByProfesionalIdAsync(${idProfesional})`);
    const sql = `SELECT id, id_profesional, id_perteneciente, fecha_sesion, nota_sesion, recomendacion FROM sesiones_profesionales WHERE id_profesional = $1 ORDER BY id DESC`;
    return await BD.query(sql, [idProfesional]);
  };

  createAsync = async (entity) => {
    console.log(`SesionProfesionalRepository.createAsync(${JSON.stringify(entity)})`);
    const sql = `
      INSERT INTO sesiones_profesionales (id_profesional, id_perteneciente, fecha_sesion, nota_sesion, recomendacion)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;
    const values = [
      entity?.id_profesional,
      entity?.id_perteneciente,
      entity?.fecha_sesion,
      entity?.nota_sesion ?? null,
      entity?.recomendacion ?? null,
    ];
    const result = await BD.queryOne(sql, values);
    return result?.id ?? 0;
  };

  updateAsync = async (entity) => {
    console.log(`SesionProfesionalRepository.updateAsync(${JSON.stringify(entity)})`);
    const id = entity.id;
    const previousEntity = await this.getByIdAsync(id);
    if (previousEntity == null) return 0;
    const sql = `
      UPDATE sesiones_profesionales
      SET id_profesional = $2, id_perteneciente = $3, fecha_sesion = $4, nota_sesion = $5, recomendacion = $6
      WHERE id = $1
    `;
    const values = [
      id,
      entity?.id_profesional ?? previousEntity.id_profesional,
      entity?.id_perteneciente ?? previousEntity.id_perteneciente,
      entity?.fecha_sesion ?? previousEntity.fecha_sesion,
      entity?.nota_sesion ?? previousEntity.nota_sesion,
      entity?.recomendacion ?? previousEntity.recomendacion,
    ];
    return await BD.execute(sql, values);
  };

  deleteByIdAsync = async (id) => {
    console.log(`SesionProfesionalRepository.deleteByIdAsync(${id})`);
    const sql = `DELETE FROM sesiones_profesionales WHERE id = $1`;
    return await BD.execute(sql, [id]);
  };
}
