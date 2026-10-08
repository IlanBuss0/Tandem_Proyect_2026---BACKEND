import CatalogRepository from './base/CatalogRepository.js';

export default class TipoMovimientoPuntoRepository extends CatalogRepository {
  constructor() {
    super({ table: 'tipos_movimientos_puntos' });
  }
}
