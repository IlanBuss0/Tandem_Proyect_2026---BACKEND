import BaseCrudRepository from './BaseCrudRepository.js';
import BD from '../db/BD.js';

class EventoRepository extends BaseCrudRepository {
  constructor() { super('sesiones_profesionales'); }
  findByPerteneciente(idPerteneciente) {
    return BD.query('SELECT * FROM sesiones_profesionales WHERE id_perteneciente = $1 ORDER BY fecha_sesion ASC', [idPerteneciente]);
  }
}
export default new EventoRepository();
