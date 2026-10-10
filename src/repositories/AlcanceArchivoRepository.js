import CatalogRepository from './base/CatalogRepository.js';

export default class AlcanceArchivoRepository extends CatalogRepository {
  constructor() {
    super({ table: 'alcances_archivos' });
  }
}
