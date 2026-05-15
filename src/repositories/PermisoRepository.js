import BaseCrudRepository from './BaseCrudRepository.js';
import BD from '../db/BD.js';

class PermisoRepository extends BaseCrudRepository {
  constructor() {
    super('permisos_otorgados_pertenecientes');
  }

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
    return BD.query(`SELECT pop.* FROM permisos_otorgados_profesionales pop
      JOIN vinculos_profesional_pertenecientes vpp ON vpp.id = pop.id_vinculo_profesional_perteneciente
      WHERE vpp.id_profesional = $1 ORDER BY pop.id DESC`, [idProfesional]);
  }

  createPerteneciente(data) {
    return this.create(data);
  }

  createProfesional(data) {
    const entries = Object.entries(data).filter(([, v]) => v !== undefined);
    const fields = entries.map(([k]) => k);
    const values = entries.map(([, v]) => v);
    const marks = fields.map((_, i) => `$${i + 1}`);
    return BD.queryOne(`INSERT INTO permisos_otorgados_profesionales (${fields.join(', ')}) VALUES (${marks.join(', ')}) RETURNING *`, values);
  }

  updateProfesional(id, data) {
    const entries = Object.entries(data).filter(([, v]) => v !== undefined);
    const sets = entries.map(([k], i) => `${k} = $${i + 1}`);
    const values = entries.map(([, v]) => v);
    return BD.queryOne(`UPDATE permisos_otorgados_profesionales SET ${sets.join(', ')} WHERE id = $${values.length + 1} RETURNING *`, [...values, id]);
  }

  async removeProfesional(id) {
    const count = await BD.execute('DELETE FROM permisos_otorgados_profesionales WHERE id = $1', [id]);
    return count > 0;
  }
}

export default new PermisoRepository();
