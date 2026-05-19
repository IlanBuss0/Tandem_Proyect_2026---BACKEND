import BD from '../db/BD.js';

export default class ResenaProfesionalRepository {
  constructor() {
    console.log('Estoy en: ResenaProfesionalRepository.constructor()');
  }

  getAllAsync = async () => {
    console.log('ResenaProfesionalRepository.getAllAsync()');
    const sql = `SELECT id, id_profesional, id_usuario, puntaje, comentario, fecha_resena FROM resenas_profesionales ORDER BY id DESC`;
    return await BD.query(sql);
  };

  getByIdAsync = async (id) => {
    console.log(`ResenaProfesionalRepository.getByIdAsync(${id})`);
    const sql = `SELECT id, id_profesional, id_usuario, puntaje, comentario, fecha_resena FROM resenas_profesionales WHERE id = $1`;
    return await BD.queryOne(sql, [id]);
  };

  createAsync = async (entity) => {
    console.log(`ResenaProfesionalRepository.createAsync(${JSON.stringify(entity)})`);
    const sql = `INSERT INTO resenas_profesionales (id_profesional, id_usuario, puntaje, comentario, fecha_resena) VALUES ($1, $2, $3, $4, $5) RETURNING id`;
    const values = [entity?.id_profesional ?? null, entity?.id_usuario ?? null, entity?.puntaje ?? null, entity?.comentario ?? null, entity?.fecha_resena ?? null];
    const result = await BD.queryOne(sql, values);
    return result?.id ?? 0;
  };

  updateAsync = async (entity) => {
    console.log(`ResenaProfesionalRepository.updateAsync(${JSON.stringify(entity)})`);
    const id = entity.id;
    const previousEntity = await this.getByIdAsync(id);
    if (previousEntity == null) return 0;
    const sql = `UPDATE resenas_profesionales SET id_profesional = $2, id_usuario = $3, puntaje = $4, comentario = $5, fecha_resena = $6 WHERE id = $1`;
    const values = [id, entity?.id_profesional ?? previousEntity.id_profesional, entity?.id_usuario ?? previousEntity.id_usuario, entity?.puntaje ?? previousEntity.puntaje, entity?.comentario ?? previousEntity.comentario, entity?.fecha_resena ?? previousEntity.fecha_resena];
    return await BD.execute(sql, values);
  };

  deleteByIdAsync = async (id) => {
    console.log(`ResenaProfesionalRepository.deleteByIdAsync(${id})`);
    const sql = `DELETE FROM resenas_profesionales WHERE id = $1`;
    return await BD.execute(sql, [id]);
  };
}
