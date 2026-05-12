import BaseCrudRepository from './BaseCrudRepository.js';

class PertenecienteRepository extends BaseCrudRepository {
  constructor() {
    super('pertenecientes');
  }
}

export default new PertenecienteRepository();
