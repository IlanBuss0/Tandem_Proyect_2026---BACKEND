import CatalogRepository from './base/CatalogRepository.js';

export default class TipoEventoAuditoriaRepository extends CatalogRepository {
  constructor() {
    super({ table: 'tipos_eventos_auditorias' });
  }
}
