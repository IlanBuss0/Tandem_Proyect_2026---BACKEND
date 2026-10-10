import CatalogRepository from './base/CatalogRepository.js';

export default class TipoPermisoArchivoRepository extends CatalogRepository {
  constructor() {
    super({ table: 'tipos_permisos_archivos' });
  }
}
