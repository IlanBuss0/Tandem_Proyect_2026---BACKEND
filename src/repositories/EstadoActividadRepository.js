import CatalogRepository from './base/CatalogRepository.js';

export default class EstadoActividadRepository extends CatalogRepository {
  constructor() {
    super({ table: 'estados_actividades' });
  }
}
