import BaseCrudRepository from './BaseCrudRepository.js';
import BD from '../db/BD.js';

class RutinaRepository extends BaseCrudRepository {
  constructor() {
    super('actividades_asignadas');
  }

  findByPerteneciente(idPerteneciente) {
    return BD.query('SELECT * FROM actividades_asignadas WHERE id_perteneciente = $1 ORDER BY id DESC', [idPerteneciente]);
  }

  findItems(idRutina) {
    return BD.query('SELECT * FROM actividades_asignadas WHERE id = $1', [idRutina]);
  }

  createItem(idRutina, data) {
    return BD.queryOne('SELECT * FROM actividades_asignadas WHERE id = $1', [idRutina]);
  }

  updateItem(idItem, data) {
    const entries = Object.entries(data).filter(([, v]) => v !== undefined);
    const sets = entries.map(([k], i) => `${k} = $${i + 1}`);
    const vals = entries.map(([, v]) => v);
    if (!vals.length) return BD.queryOne('SELECT * FROM actividades_asignadas WHERE id = $1', [idItem]);
    return BD.queryOne(`UPDATE actividades_asignadas SET ${sets.join(', ')} WHERE id = $${vals.length + 1} RETURNING *`, [...vals, idItem]);
  }

  async removeItem(idItem) {
    const deleted = await BD.queryOne('DELETE FROM actividades_asignadas WHERE id = $1 RETURNING id', [idItem]);
    return Boolean(deleted);
  }
}

export default new RutinaRepository();
