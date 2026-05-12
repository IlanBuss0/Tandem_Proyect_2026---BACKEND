import BaseCrudRepository from './BaseCrudRepository.js';

class AdministradorRepository extends BaseCrudRepository {
  constructor() {
    super('administradores');
  }
}

export default new AdministradorRepository();
