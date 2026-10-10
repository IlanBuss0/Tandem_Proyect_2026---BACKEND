import CatalogRepository from './base/CatalogRepository.js';

export default class RolAdministradorRepository extends CatalogRepository {
  constructor() {
    super({ table: 'roles_administradores' });
  }
}
