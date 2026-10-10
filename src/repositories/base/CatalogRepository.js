import BaseCrudRepository from './BaseCrudRepository.js';

export default class CatalogRepository extends BaseCrudRepository {
  constructor({ table }) {
    super({
      table,
      selectColumns: ['id', 'nombre', 'orden'],
      insertColumns: ['nombre', 'orden'],
      updateColumns: ['nombre', 'orden'],
      orderBy: 'id DESC',
      insertNullishAsNull: true,
    });
  }
}
