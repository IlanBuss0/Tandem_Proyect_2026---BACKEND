import BaseCrudRepository from './BaseCrudRepository.js';

class RutinaRepository extends BaseCrudRepository {
  constructor() {
    super('rutinas');
  }
}

export default new RutinaRepository();
