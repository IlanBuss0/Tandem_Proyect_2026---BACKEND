import BaseCrudRepository from './BaseCrudRepository.js';
import BD from '../db/BD.js';
class ObjetivoRepository extends BaseCrudRepository {
  constructor() { super('objetivos'); }
  findByPerteneciente(id) { return BD.query('SELECT * FROM objetivos WHERE id_perteneciente = $1 ORDER BY id DESC', [id]); }
}
export default new ObjetivoRepository();
