import BaseCrudRepository from './BaseCrudRepository.js';
import BD from '../db/BD.js';
class EmocionRepository extends BaseCrudRepository {
  constructor() { super('emociones'); }
  findByPerteneciente(id) { return BD.query('SELECT * FROM emociones WHERE id_perteneciente = $1 ORDER BY id DESC', [id]); }
}
export default new EmocionRepository();
