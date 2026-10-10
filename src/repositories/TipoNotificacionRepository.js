import CatalogRepository from './base/CatalogRepository.js';

export default class TipoNotificacionRepository extends CatalogRepository {
  constructor() {
    super({ table: 'tipos_notificaciones' });
  }
}
