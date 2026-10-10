import BD from '../../db/BD.js';

const identifier = (value) => {
  if (typeof value !== 'string' || !/^[a-z_][a-z0-9_]*$/i.test(value)) {
    throw new Error('Identificador SQL invalido.');
  }
  return value;
};

const columns = (values) => {
  if (!Array.isArray(values) || values.length === 0) {
    throw new Error('La configuracion CRUD requiere columnas.');
  }
  return values.map(identifier);
};

export default class BaseCrudRepository {
  constructor({ table, selectColumns, insertColumns, updateColumns, orderBy = 'id DESC', insertNullishAsNull = false }) {
    this.table = identifier(table);
    this.selectColumns = columns(selectColumns);
    this.insertColumns = columns(insertColumns);
    this.updateColumns = columns(updateColumns);
    this.orderBy = orderBy.split(/\s+/).map((part, index) => index % 2 === 0 ? identifier(part) : /^(ASC|DESC)$/i.test(part) ? part.toUpperCase() : identifier(part)).join(' ');
    this.insertNullishAsNull = insertNullishAsNull;
    this.selection = this.selectColumns.join(', ');
  }

  getAllAsync = async () => BD.query(
    `SELECT ${this.selection} FROM ${this.table} ORDER BY ${this.orderBy}`,
  );

  getByIdAsync = async (id) => BD.queryOne(
    `SELECT ${this.selection} FROM ${this.table} WHERE id = $1`,
    [id],
  );

  createAsync = async (entity) => {
    const placeholders = this.insertColumns.map((_, index) => `$${index + 1}`).join(', ');
    const values = this.insertColumns.map((column) => (
      this.insertNullishAsNull ? entity?.[column] ?? null : entity?.[column]
    ));
    const result = await BD.queryOne(
      `INSERT INTO ${this.table} (${this.insertColumns.join(', ')}) VALUES (${placeholders}) RETURNING id`,
      values,
    );
    return result?.id ?? 0;
  };

  updateAsync = async (entity) => {
    const previousEntity = await this.getByIdAsync(entity.id);
    if (previousEntity == null) return 0;
    const assignments = this.updateColumns.map((column, index) => `${column} = $${index + 2}`).join(', ');
    const values = [
      entity.id,
      ...this.updateColumns.map((column) => entity?.[column] ?? previousEntity[column]),
    ];
    return BD.execute(
      `UPDATE ${this.table} SET ${assignments} WHERE id = $1`,
      values,
    );
  };

  deleteByIdAsync = async (id) => BD.execute(
    `DELETE FROM ${this.table} WHERE id = $1`,
    [id],
  );
}
