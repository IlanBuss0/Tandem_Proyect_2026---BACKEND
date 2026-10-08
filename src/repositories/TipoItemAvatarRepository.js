import CatalogRepository from './base/CatalogRepository.js';

export default class TipoItemAvatarRepository extends CatalogRepository {
  constructor() {
    super({ table: 'tipos_items_avatares' });
  }
}
