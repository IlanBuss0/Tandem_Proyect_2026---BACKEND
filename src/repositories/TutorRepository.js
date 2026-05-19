import BD from '../db/BD.js';

export default class TutorRepository {
  constructor() {
    console.log('Estoy en: TutorRepository.constructor()');
  }

  getAllAsync = async () => {
    console.log('TutorRepository.getAllAsync()');
    const sql = `SELECT id, id_usuario, parentesco FROM tutores ORDER BY id DESC`;
    return await BD.query(sql);
  };

  getByIdAsync = async (id) => {
    console.log(`TutorRepository.getByIdAsync(${id})`);
    const sql = `SELECT id, id_usuario, parentesco FROM tutores WHERE id = $1`;
    return await BD.queryOne(sql, [id]);
  };

  getByUsuarioIdAsync = async (idUsuario) => {
    console.log(`TutorRepository.getByUsuarioIdAsync(${idUsuario})`);
    const sql = `SELECT id, id_usuario, parentesco FROM tutores WHERE id_usuario = $1`;
    return await BD.queryOne(sql, [idUsuario]);
  };

  createAsync = async (entity) => {
    console.log(`TutorRepository.createAsync(${JSON.stringify(entity)})`);
    const sql = `INSERT INTO tutores (id_usuario, parentesco) VALUES ($1, $2) RETURNING id`;
    const values = [entity?.id_usuario, entity?.parentesco ?? null];
    const result = await BD.queryOne(sql, values);
    return result?.id ?? 0;
  };

  updateAsync = async (entity) => {
    console.log(`TutorRepository.updateAsync(${JSON.stringify(entity)})`);
    const id = entity.id;
    const previousEntity = await this.getByIdAsync(id);
    if (previousEntity == null) return 0;
    const sql = `UPDATE tutores SET id_usuario = $2, parentesco = $3 WHERE id = $1`;
    const values = [id, entity?.id_usuario ?? previousEntity.id_usuario, entity?.parentesco ?? previousEntity.parentesco];
    return await BD.execute(sql, values);
  };

  deleteByIdAsync = async (id) => {
    console.log(`TutorRepository.deleteByIdAsync(${id})`);
    const sql = `DELETE FROM tutores WHERE id = $1`;
    return await BD.execute(sql, [id]);
  };
}
