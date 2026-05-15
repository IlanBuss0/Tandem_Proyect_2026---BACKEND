import BaseCrudRepository from './BaseCrudRepository.js';
import BD from '../db/BD.js';

class EventoRepository extends BaseCrudRepository {
  constructor() { super('eventos'); }
  findByPerteneciente(idPerteneciente) {
    return BD.query('SELECT * FROM eventos WHERE id_perteneciente = $1 ORDER BY fecha_inicio ASC', [idPerteneciente]);
  }
}
export default new EventoRepository();
