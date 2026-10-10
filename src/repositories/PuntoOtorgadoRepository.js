import CatalogRepository from './base/CatalogRepository.js';

export default class PuntoOtorgadoRepository extends CatalogRepository {
  constructor() {
    super({ table: 'puntos_otorgados' });
  }
}
