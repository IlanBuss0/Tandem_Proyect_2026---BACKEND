import CatalogRepository from './base/CatalogRepository.js';

export default class CatalogoPermisoProfesionalRepository extends CatalogRepository {
  constructor() {
    super({ table: 'catalogo_permisos_profesionales' });
  }
}
