import CatalogRepository from './base/CatalogRepository.js';

export default class CatalogoPermisoPertenecienteRepository extends CatalogRepository {
  constructor() {
    super({ table: 'catalogo_permisos_pertenecientes' });
  }
}
