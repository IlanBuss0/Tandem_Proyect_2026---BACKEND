import CatalogRepository from './base/CatalogRepository.js';

export default class EstadoSuscripcionRepository extends CatalogRepository {
  constructor() {
    super({ table: 'estados_suscripciones' });
  }
}
