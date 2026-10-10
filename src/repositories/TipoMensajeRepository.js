import CatalogRepository from './base/CatalogRepository.js';

export default class TipoMensajeRepository extends CatalogRepository {
  constructor() {
    super({ table: 'tipos_mensajes' });
  }
}
