import CatalogRepository from './base/CatalogRepository.js';

export default class EstadoValidacionProfesionalRepository extends CatalogRepository {
  constructor() {
    super({ table: 'estados_validaciones_profesionales' });
  }
}
