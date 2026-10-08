import CatalogRepository from './base/CatalogRepository.js';

export default class TipoActividadRepository extends CatalogRepository {
  constructor() {
    super({ table: 'tipos_actividades' });
  }
}
