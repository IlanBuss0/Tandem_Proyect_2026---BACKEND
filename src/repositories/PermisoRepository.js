import BD from '../db/BD.js';

class PermisoRepository {
  findAllPertenecientes() {
    return BD.query('SELECT * FROM permisos_otorgados_pertenecientes ORDER BY id DESC');
  }

  findAllProfesionales() {
    return BD.query('SELECT * FROM permisos_otorgados_profesionales ORDER BY id DESC');
  }

  findByPerteneciente(idPerteneciente) {
    return BD.query('SELECT * FROM permisos_otorgados_pertenecientes WHERE id_perteneciente = $1 ORDER BY id DESC', [idPerteneciente]);
  }

  findByProfesional(idProfesional) {
    return BD.query(
      `SELECT pop.*
       FROM permisos_otorgados_profesionales pop
       JOIN vinculos_profesional_pertenecientes vpp ON vpp.id = pop.id_vinculo_profesional_perteneciente
       WHERE vpp.id_profesional = $1
       ORDER BY pop.id DESC`,
      [idProfesional],
    );
  }

  createPerteneciente(data) {
    const entries = Object.entries(data).filter(([, value]) => value !== undefined);
    const fields = entries.map(([key]) => key);
    const values = entries.map(([, value]) => value);
    const placeholders = fields.map((_, i) => `$${i + 1}`);
    return BD.queryOne(`INSERT INTO permisos_otorgados_pertenecientes (${fields.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`, values);
  }

  createProfesional(data) {
    const entries = Object.entries(data).filter(([, value]) => value !== undefined);
    const fields = entries.map(([key]) => key);
    const values = entries.map(([, value]) => value);
    const placeholders = fields.map((_, i) => `$${i + 1}`);
    return BD.queryOne(`INSERT INTO permisos_otorgados_profesionales (${fields.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`, values);
  }

  updatePerteneciente(id, data) {
    const entries = Object.entries(data).filter(([, value]) => value !== undefined);
    if (!entries.length) return null;
    const sets = entries.map(([key], i) => `${key} = $${i + 1}`);
    const values = entries.map(([, value]) => value);
    return BD.queryOne(`UPDATE permisos_otorgados_pertenecientes SET ${sets.join(', ')} WHERE id = $${values.length + 1} RETURNING *`, [...values, id]);
  }

  updateProfesional(id, data) {
    const entries = Object.entries(data).filter(([, value]) => value !== undefined);
    if (!entries.length) return null;
    const sets = entries.map(([key], i) => `${key} = $${i + 1}`);
    const values = entries.map(([, value]) => value);
    return BD.queryOne(`UPDATE permisos_otorgados_profesionales SET ${sets.join(', ')} WHERE id = $${values.length + 1} RETURNING *`, [...values, id]);
  }

  async removePerteneciente(id) {
    const count = await BD.execute('DELETE FROM permisos_otorgados_pertenecientes WHERE id = $1', [id]);
    return count > 0;
  }

  async removeProfesional(id) {
    const count = await BD.execute('DELETE FROM permisos_otorgados_profesionales WHERE id = $1', [id]);
    return count > 0;
  }
}

export default new PermisoRepository();
