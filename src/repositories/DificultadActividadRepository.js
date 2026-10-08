import CatalogRepository from './base/CatalogRepository.js';

export default class DificultadActividadRepository extends CatalogRepository {
  constructor() {
    super({ table: 'dificultades_actividades' });
  }
}
