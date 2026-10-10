import CatalogRepository from './base/CatalogRepository.js';

export default class EstadoReporteRepository extends CatalogRepository {
  constructor() {
    super({ table: 'estados_reportes' });
  }
}
