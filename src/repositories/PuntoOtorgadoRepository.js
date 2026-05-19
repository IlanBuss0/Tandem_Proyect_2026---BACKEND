import BD from '../db/BD.js';

export default class PuntoOtorgadoRepository {
  constructor() {
    console.log('Estoy en: PuntoOtorgadoRepository.constructor()');
  }

  getAllAsync = async () => await BD.query(`SELECT * FROM puntos_otorgados ORDER BY id DESC`);

  getByIdAsync = async (id) => await BD.queryOne(`SELECT * FROM puntos_otorgados WHERE id = $1`, [id]);

  createAsync = async (entity) => {
    const sql = `INSERT INTO puntos_otorgados SELECT * FROM json_populate_record(NULL::puntos_otorgados, $1) RETURNING id`;
    const result = await BD.queryOne(sql, [entity]);
    return result?.id ?? 0;
  };

  updateAsync = async (entity) => {
    const previousEntity = await this.getByIdAsync(entity.id);
    if (previousEntity == null) return 0;
    const sql = `UPDATE puntos_otorgados SET ({fields}) = ({values}) WHERE id = $1`;
    const keys = Object.keys(entity).filter((k) => k !== 'id');
    if (keys.length === 0) return 0;
    const setFields = keys.join(', ');
    const placeholders = keys.map((_, i) => `$${i + 2}`).join(', ');
    return await BD.execute(sql.replace('{fields}', setFields).replace('{values}', placeholders), [entity.id, ...keys.map((k) => entity[k])]);
  };

  deleteByIdAsync = async (id) => await BD.execute(`DELETE FROM puntos_otorgados WHERE id = $1`, [id]);
}
