import BD from '../db/BD.js';

export default class EstadoPagoRepository {
  constructor() {
    console.log('Estoy en: EstadoPagoRepository.constructor()');
  }

  getAllAsync = async () => {
    console.log('EstadoPagoRepository.getAllAsync()');
    const sql = `SELECT id, nombre, orden FROM estados_pagos ORDER BY id DESC`;
    return await BD.query(sql);
  };

  getByIdAsync = async (id) => {
    console.log(`EstadoPagoRepository.getByIdAsync(${id})`);
    const sql = `SELECT id, nombre, orden FROM estados_pagos WHERE id = $1`;
    return await BD.queryOne(sql, [id]);
  };

  createAsync = async (entity) => {
    console.log(`EstadoPagoRepository.createAsync(${JSON.stringify(entity)})`);
    const sql = `INSERT INTO estados_pagos (nombre, orden) VALUES ($1, $2) RETURNING id`;
    const values = [entity?.nombre ?? null, entity?.orden ?? null];
    const result = await BD.queryOne(sql, values);
    return result?.id ?? 0;
  };

  updateAsync = async (entity) => {
    console.log(`EstadoPagoRepository.updateAsync(${JSON.stringify(entity)})`);
    const id = entity.id;
    const previousEntity = await this.getByIdAsync(id);
    if (previousEntity == null) return 0;
    const sql = `UPDATE estados_pagos SET nombre = $2, orden = $3 WHERE id = $1`;
    const values = [id, entity?.nombre ?? previousEntity.nombre, entity?.orden ?? previousEntity.orden];
    return await BD.execute(sql, values);
  };

  deleteByIdAsync = async (id) => {
    console.log(`EstadoPagoRepository.deleteByIdAsync(${id})`);
    const sql = `DELETE FROM estados_pagos WHERE id = $1`;
    return await BD.execute(sql, [id]);
  };
}
