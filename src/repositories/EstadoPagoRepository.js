import CatalogRepository from './base/CatalogRepository.js';

export default class EstadoPagoRepository extends CatalogRepository {
  constructor() {
    super({ table: 'estados_pagos' });
  }
}
