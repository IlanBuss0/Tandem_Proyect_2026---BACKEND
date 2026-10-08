import CatalogRepository from './base/CatalogRepository.js';

export default class AutonomiaOperativaRepository extends CatalogRepository {
  constructor() {
    super({ table: 'autonomias_operativas' });
  }
}
