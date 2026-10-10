import CatalogRepository from './base/CatalogRepository.js';

export default class TipoEventoZonaSeguraRepository extends CatalogRepository {
  constructor() {
    super({ table: 'tipos_eventos_zonas_seguras' });
  }
}
