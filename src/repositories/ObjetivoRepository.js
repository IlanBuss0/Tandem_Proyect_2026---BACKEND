import BaseCrudRepository from './BaseCrudRepository.js';
import BD from '../db/BD.js';
class ObjetivoRepository extends BaseCrudRepository {
  constructor() { super('actividades_asignadas'); }
  findByPerteneciente(id) { return BD.query('SELECT * FROM actividades_asignadas WHERE id_perteneciente = $1 ORDER BY id DESC', [id]); }
}
export default new ObjetivoRepository();
