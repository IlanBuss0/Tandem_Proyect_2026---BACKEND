import BD from '../db/BD.js';

export default class EstadoPagoRepository {
  constructor() {
    console.log('Estoy en: EstadoPagoRepository.constructor()');
  }

  getAllAsync = async () => {
    console.log('EstadoPagoRepository.getAllAsync()');
    const sql = `SELECT * FROM estados_pagos ORDER BY id DESC`;
    return await BD.query(sql);
  };

  getByIdAsync = async (id) => {
    console.log(`EstadoPagoRepository.getByIdAsync(${id})`);
    const sql = `SELECT * FROM estados_pagos WHERE id = $1`;
    return await BD.queryOne(sql, [id]);
  };

  createAsync = async (entity) => {
    console.log(`EstadoPagoRepository.createAsync(${JSON.stringify(entity)})`);
    const keys = Object.keys(entity ?? {}).filter((k) => k !== 'id' && entity[k] !== undefined);
    if (keys.length === 0) return 0;

    const fields = keys.join(', ');
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
    const values = keys.map((key) => entity[key]);

    const sql = `INSERT INTO estados_pagos (${fields}) VALUES (${placeholders}) RETURNING id`;
    const result = await BD.queryOne(sql, values);
    return result?.id ?? 0;
  };

  updateAsync = async (entity) => {
    console.log(`EstadoPagoRepository.updateAsync(${JSON.stringify(entity)})`);
    const id = entity.id;
    const previousEntity = await this.getByIdAsync(id);
    if (previousEntity == null) return 0;

    const keys = Object.keys(entity ?? {}).filter((k) => k !== 'id' && entity[k] !== undefined);
    if (keys.length === 0) return 0;

    const setClause = keys.map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = [id, ...keys.map((key) => entity[key])];

    const sql = `UPDATE estados_pagos SET ${setClause} WHERE id = $1`;
    return await BD.execute(sql, values);
  };

  deleteByIdAsync = async (id) => {
    console.log(`EstadoPagoRepository.deleteByIdAsync(${id})`);
    const sql = `DELETE FROM estados_pagos WHERE id = $1`;
    return await BD.execute(sql, [id]);
  };
}
