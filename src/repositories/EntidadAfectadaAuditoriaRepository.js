import CatalogRepository from './base/CatalogRepository.js';

export default class EntidadAfectadaAuditoriaRepository extends CatalogRepository {
  constructor() {
    super({ table: 'entidades_afectadas_auditorias' });
  }
}
