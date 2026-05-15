import BD from '../db/BD.js';

class PermisoRepository {
  findAllPertenecientes() {
    return BD.query("SELECT * FROM permisos WHERE tipo_permiso = 'perteneciente' ORDER BY id DESC");
  }

  findAllProfesionales() {
    return BD.query("SELECT * FROM permisos WHERE tipo_permiso = 'profesional' ORDER BY id DESC");
  }

  findByPerteneciente(idPerteneciente) {
    return BD.query('SELECT * FROM permisos WHERE id_perteneciente = $1 ORDER BY id DESC', [idPerteneciente]);
  }

  findByProfesional(idProfesional) {
    return BD.query('SELECT * FROM permisos WHERE id_profesional = $1 ORDER BY id DESC', [idProfesional]);
  }

  create(data) {
    const entries = Object.entries(data).filter(([, v]) => v !== undefined);
    const fields = entries.map(([k]) => k);
    const values = entries.map(([, v]) => v);
    const marks = fields.map((_, i) => `$${i + 1}`);
    return BD.queryOne(`INSERT INTO permisos (${fields.join(', ')}) VALUES (${marks.join(', ')}) RETURNING *`, values);
  }

  update(id, data) {
    const entries = Object.entries(data).filter(([, v]) => v !== undefined);
    const sets = entries.map(([k], i) => `${k} = $${i + 1}`);
    const values = entries.map(([, v]) => v);
    return BD.queryOne(`UPDATE permisos SET ${sets.join(', ')} WHERE id = $${values.length + 1} RETURNING *`, [...values, id]);
  }

  remove(id) {
    return BD.execute('DELETE FROM permisos WHERE id = $1', [id]);
  }
}

export default new PermisoRepository();
