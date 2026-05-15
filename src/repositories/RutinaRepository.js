import BaseCrudRepository from './BaseCrudRepository.js';
import BD from '../db/BD.js';

class RutinaRepository extends BaseCrudRepository {
  constructor() {
    super('rutinas');
  }

  findByPerteneciente(idPerteneciente) {
    return BD.query('SELECT * FROM rutinas WHERE id_perteneciente = $1 ORDER BY id DESC', [idPerteneciente]);
  }

  findItems(idRutina) {
    return BD.query('SELECT * FROM rutina_items WHERE id_rutina = $1 ORDER BY id ASC', [idRutina]);
  }

  createItem(idRutina, data) {
    const entries = Object.entries({ ...data, id_rutina: idRutina }).filter(([, v]) => v !== undefined);
    const fields = entries.map(([k]) => k);
    const values = entries.map(([, v]) => v);
    const marks = fields.map((_, i) => `$${i + 1}`);
    return BD.queryOne(`INSERT INTO rutina_items (${fields.join(', ')}) VALUES (${marks.join(', ')}) RETURNING *`, values);
  }

  updateItem(idItem, data) {
    const entries = Object.entries(data).filter(([, v]) => v !== undefined);
    const sets = entries.map(([k], i) => `${k} = $${i + 1}`);
    const vals = entries.map(([, v]) => v);
    return BD.queryOne(`UPDATE rutina_items SET ${sets.join(', ')} WHERE id = $${vals.length + 1} RETURNING *`, [...vals, idItem]);
  }

  removeItem(idItem) {
    return BD.execute('DELETE FROM rutina_items WHERE id = $1', [idItem]);
  }
}

export default new RutinaRepository();
