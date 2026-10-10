import CatalogRepository from './base/CatalogRepository.js';

export default class EstadoVinculoRepository extends CatalogRepository {
  constructor() {
    super({ table: 'estados_vinculos' });
  }
}
