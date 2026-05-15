import BaseCrudRepository from './BaseCrudRepository.js';
import BD from '../db/BD.js';
class EmocionRepository extends BaseCrudRepository {
  constructor() { super('evaluaciones_autonomias'); }
  findByPerteneciente(id) { return BD.query('SELECT * FROM evaluaciones_autonomias WHERE id_perteneciente = $1 ORDER BY id DESC', [id]); }
  constructor() { super('emociones'); }
  findByPerteneciente(id) { return BD.query('SELECT * FROM emociones WHERE id_perteneciente = $1 ORDER BY id DESC', [id]); }
}
export default new EmocionRepository();
