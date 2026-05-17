import BD from '../db/BD.js';

export default class SaldoPuntoRepository {
  constructor() {
    console.log('Estoy en: SaldoPuntoRepository.constructor()');
  }

  getAllAsync = async () => {
    console.log('SaldoPuntoRepository.getAllAsync()');
    const sql = `SELECT id, id_perteneciente, saldo FROM saldos_puntos ORDER BY id DESC`;
    return await BD.query(sql);
  };

  getByIdAsync = async (id) => {
    console.log(`SaldoPuntoRepository.getByIdAsync(${id})`);
    const sql = `SELECT id, id_perteneciente, saldo FROM saldos_puntos WHERE id = $1`;
    return await BD.queryOne(sql, [id]);
  };

  getByPertenecienteIdAsync = async (idPerteneciente) => {
    console.log(`SaldoPuntoRepository.getByPertenecienteIdAsync(${idPerteneciente})`);
    const sql = `SELECT id, id_perteneciente, saldo FROM saldos_puntos WHERE id_perteneciente = $1`;
    return await BD.queryOne(sql, [idPerteneciente]);
  };

  createAsync = async (entity) => {
    console.log(`SaldoPuntoRepository.createAsync(${JSON.stringify(entity)})`);
    const sql = `
      INSERT INTO saldos_puntos (id_perteneciente, saldo)
      VALUES ($1, COALESCE($2, 0))
      RETURNING id
    `;
    const values = [entity?.id_perteneciente, entity?.saldo ?? 0];
    const result = await BD.queryOne(sql, values);
    return result?.id ?? 0;
  };

  updateAsync = async (entity) => {
    console.log(`SaldoPuntoRepository.updateAsync(${JSON.stringify(entity)})`);
    const id = entity.id;
    const previousEntity = await this.getByIdAsync(id);
    if (previousEntity == null) return 0;
    const sql = `UPDATE saldos_puntos SET id_perteneciente = $2, saldo = $3 WHERE id = $1`;
    const values = [
      id,
      entity?.id_perteneciente ?? previousEntity.id_perteneciente,
      entity?.saldo ?? previousEntity.saldo,
    ];
    return await BD.execute(sql, values);
  };

  deleteByIdAsync = async (id) => {
    console.log(`SaldoPuntoRepository.deleteByIdAsync(${id})`);
    const sql = `DELETE FROM saldos_puntos WHERE id = $1`;
    return await BD.execute(sql, [id]);
  };
}
