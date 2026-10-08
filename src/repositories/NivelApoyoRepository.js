import CatalogRepository from './base/CatalogRepository.js';

export default class NivelApoyoRepository extends CatalogRepository {
  constructor() {
    super({ table: 'niveles_apoyos' });
  }
}
