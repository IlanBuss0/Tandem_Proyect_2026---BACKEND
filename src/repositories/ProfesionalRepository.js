import BaseCrudRepository from './BaseCrudRepository.js';

class ProfesionalRepository extends BaseCrudRepository {
  constructor() {
    super('profesionales');
  }
}

export default ProfesionalRepository;
