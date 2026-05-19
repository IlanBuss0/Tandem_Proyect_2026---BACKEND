import BD from '../db/BD.js';

export default class PermisoOtorgadoPertenecienteRepository {
  constructor() {
    console.log('Estoy en: PermisoOtorgadoPertenecienteRepository.constructor()');
  }

  getAllAsync = async () => {
    console.log('PermisoOtorgadoPertenecienteRepository.getAllAsync()');
    const sql = `SELECT * FROM permisos_otorgados_pertenecientes ORDER BY id DESC`;
    return await BD.query(sql);
  };

  getByIdAsync = async (id) => {
    console.log(`PermisoOtorgadoPertenecienteRepository.getByIdAsync(${id})`);
    const sql = `SELECT * FROM permisos_otorgados_pertenecientes WHERE id = $1`;
    return await BD.queryOne(sql, [id]);
  };

  createAsync = async (entity) => {
    console.log(`PermisoOtorgadoPertenecienteRepository.createAsync(${JSON.stringify(entity)})`);
    const keys = Object.keys(entity ?? {}).filter((k) => k !== 'id' && entity[k] !== undefined);
    if (keys.length === 0) return 0;

    const fields = keys.join(', ');
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
    const values = keys.map((key) => entity[key]);

    const sql = `INSERT INTO permisos_otorgados_pertenecientes (${fields}) VALUES (${placeholders}) RETURNING id`;
    const result = await BD.queryOne(sql, values);
    return result?.id ?? 0;
  };

  updateAsync = async (entity) => {
    console.log(`PermisoOtorgadoPertenecienteRepository.updateAsync(${JSON.stringify(entity)})`);
    const id = entity.id;
    const previousEntity = await this.getByIdAsync(id);
    if (previousEntity == null) return 0;

    const keys = Object.keys(entity ?? {}).filter((k) => k !== 'id' && entity[k] !== undefined);
    if (keys.length === 0) return 0;

    const setClause = keys.map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = [id, ...keys.map((key) => entity[key])];

    const sql = `UPDATE permisos_otorgados_pertenecientes SET ${setClause} WHERE id = $1`;
    return await BD.execute(sql, values);
  };

  deleteByIdAsync = async (id) => {
    console.log(`PermisoOtorgadoPertenecienteRepository.deleteByIdAsync(${id})`);
    const sql = `DELETE FROM permisos_otorgados_pertenecientes WHERE id = $1`;
    return await BD.execute(sql, [id]);
  };
}
