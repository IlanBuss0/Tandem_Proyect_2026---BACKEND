import CatalogRepository from './base/CatalogRepository.js';

export default class TipoArchivoRepository extends CatalogRepository {
  constructor() {
    super({ table: 'tipos_archivos' });
  }
}
