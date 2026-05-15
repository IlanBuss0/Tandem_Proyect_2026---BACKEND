import BD from '../db/BD.js';
import BaseCrudRepository from './BaseCrudRepository.js';

class SuscripcionRepository extends BaseCrudRepository {
  constructor() {
    super('suscripciones', { softDelete: { field: 'fecha_fin' } });
  }

  findPlanes() {
    return BD.query('SELECT * FROM planes_suscripciones ORDER BY id ASC');
  }

  findPlanById(id) {
    return BD.queryOne('SELECT * FROM planes_suscripciones WHERE id = $1', [id]);
    super('suscripciones');
  }

  findPlanes() {
    return BD.query('SELECT * FROM planes_suscripcion ORDER BY id ASC');
  }

  findPlanById(id) {
    return BD.queryOne('SELECT * FROM planes_suscripcion WHERE id = $1', [id]);
  }
}

export default new SuscripcionRepository();
