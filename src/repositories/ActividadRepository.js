import BaseCrudRepository from './BaseCrudRepository.js';

class ActividadRepository extends BaseCrudRepository {
  constructor() {
    super('actividades');
  }
}

export default new ActividadRepository();
