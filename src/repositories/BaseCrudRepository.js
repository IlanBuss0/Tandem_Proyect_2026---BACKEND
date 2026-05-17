import BD from '../db/BD.js';

export default class BaseCrudRepository {
  constructor(tableName, { idField = 'id', softDelete = null } = {}) {
    this.tableName = tableName;
    this.idField = idField;
    this.softDelete = softDelete;
  }

  findAll() {
    return BD.query(`SELECT * FROM ${this.tableName} ORDER BY ${this.idField} DESC`);
  }

  findById(id) {
    return BD.queryOne(`SELECT * FROM ${this.tableName} WHERE ${this.idField} = $1`, [id]);
  }

  create(data) {
    const entries = Object.entries(data).filter(([, value]) => value !== undefined);
    const fields = entries.map(([key]) => key);
    const values = entries.map(([, value]) => value);
    const placeholders = fields.map((_, i) => `$${i + 1}`);
    const sql = `INSERT INTO ${this.tableName} (${fields.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`;
    return BD.queryOne(sql, values);
  }

  update(id, data) {
    const entries = Object.entries(data).filter(([, value]) => value !== undefined);
    if (!entries.length) return this.findById(id);
    const sets = entries.map(([key], i) => `${key} = $${i + 1}`);
    const values = entries.map(([, value]) => value);
    const sql = `UPDATE ${this.tableName} SET ${sets.join(', ')} WHERE ${this.idField} = $${values.length + 1} RETURNING *`;
    return BD.queryOne(sql, [...values, id]);
  }

  async remove(id) {
    if (this.softDelete?.field === 'activo') {
      const row = await BD.queryOne(`UPDATE ${this.tableName} SET activo = false WHERE ${this.idField} = $1 RETURNING ${this.idField}`, [id]);
      return Boolean(row);
    }
    if (this.softDelete?.field === 'fecha_fin') {
      const row = await BD.queryOne(`UPDATE ${this.tableName} SET fecha_fin = NOW() WHERE ${this.idField} = $1 RETURNING ${this.idField}`, [id]);
      return Boolean(row);
    }
    if (this.softDelete?.field === 'fecha_baja') {
      const row = await BD.queryOne(`UPDATE ${this.tableName} SET fecha_baja = NOW() WHERE ${this.idField} = $1 RETURNING ${this.idField}`, [id]);
      return Boolean(row);
    }
    if (this.softDelete?.field === 'fecha_resolucion') {
      const row = await BD.queryOne(`UPDATE ${this.tableName} SET fecha_resolucion = NOW() WHERE ${this.idField} = $1 RETURNING ${this.idField}`, [id]);
      return Boolean(row);
    }
    const deleted = await BD.queryOne(`DELETE FROM ${this.tableName} WHERE ${this.idField} = $1 RETURNING ${this.idField}`, [id]);
    return Boolean(deleted);
  }
}
