import CatalogRepository from './base/CatalogRepository.js';

export default class TipoUsuarioRepository extends CatalogRepository {
  constructor() {
    super({ table: 'tipos_usuarios' });
  }
}
