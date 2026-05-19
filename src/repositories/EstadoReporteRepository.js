import BD from '../db/BD.js';

export default class EstadoReporteRepository {
  constructor() {
    console.log('Estoy en: EstadoReporteRepository.constructor()');
  }

  getAllAsync = async () => await BD.query(`SELECT * FROM estados_reportes ORDER BY id DESC`);

  getByIdAsync = async (id) => await BD.queryOne(`SELECT * FROM estados_reportes WHERE id = $1`, [id]);

  createAsync = async (entity) => {
    const sql = `INSERT INTO estados_reportes SELECT * FROM json_populate_record(NULL::estados_reportes, $1) RETURNING id`;
    const result = await BD.queryOne(sql, [entity]);
    return result?.id ?? 0;
  };

  updateAsync = async (entity) => {
    const previousEntity = await this.getByIdAsync(entity.id);
    if (previousEntity == null) return 0;
    const sql = `UPDATE estados_reportes SET ({fields}) = ({values}) WHERE id = $1`;
    const keys = Object.keys(entity).filter((k) => k !== 'id');
    if (keys.length === 0) return 0;
    const setFields = keys.join(', ');
    const placeholders = keys.map((_, i) => `$${i + 2}`).join(', ');
    return await BD.execute(sql.replace('{fields}', setFields).replace('{values}', placeholders), [entity.id, ...keys.map((k) => entity[k])]);
  };

  deleteByIdAsync = async (id) => await BD.execute(`DELETE FROM estados_reportes WHERE id = $1`, [id]);
}
