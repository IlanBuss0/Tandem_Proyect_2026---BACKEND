import CatalogRepository from './base/CatalogRepository.js';

export default class EstadoContactoRepository extends CatalogRepository {
  constructor() {
    super({ table: 'estados_contactos' });
  }
}
