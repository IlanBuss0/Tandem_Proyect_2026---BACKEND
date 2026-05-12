import BaseCrudRepository from './BaseCrudRepository.js';

class TutorRepository extends BaseCrudRepository {
  constructor() {
    super('tutores');
  }
}

export default new TutorRepository();
