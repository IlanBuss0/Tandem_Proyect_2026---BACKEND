import BaseCrudRepository from './BaseCrudRepository.js';
import BD from '../db/BD.js';

class VinculoProfesionalPertenecienteRepository extends BaseCrudRepository {
  constructor() { super('vinculos_profesional_pertenecientes', { softDelete: { field: 'fecha_fin' } }); }
  findByProfesional(idProfesional) { return BD.query('SELECT p.* FROM vinculos_profesional_pertenecientes v JOIN pertenecientes p ON p.id = v.id_perteneciente WHERE v.id_profesional = $1 ORDER BY p.id DESC', [idProfesional]); }
  findByPerteneciente(idPerteneciente) { return BD.query('SELECT pr.* FROM vinculos_profesional_pertenecientes v JOIN profesionales pr ON pr.id = v.id_profesional WHERE v.id_perteneciente = $1 ORDER BY pr.id DESC', [idPerteneciente]); }
import BD from '../db/BD.js';

class VinculoProfesionalPertenecienteRepository {
  findAll() {
    return BD.query('SELECT * FROM vinculos_profesional_perteneciente ORDER BY id DESC');
  }

  create(data) {
    const entries = Object.entries(data).filter(([, v]) => v !== undefined);
    const fields = entries.map(([k]) => k);
    const values = entries.map(([, v]) => v);
    const placeholders = fields.map((_, i) => `$${i + 1}`);
    return BD.queryOne(`INSERT INTO vinculos_profesional_perteneciente (${fields.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`, values);
  }

  async remove(id) {
    const count = await BD.execute('DELETE FROM vinculos_profesional_perteneciente WHERE id = $1', [id]);
    return count > 0;
  }

  findByProfesional(idProfesional) {
    return BD.query(
      `SELECT p.* FROM vinculos_profesional_perteneciente v
       JOIN pertenecientes p ON p.id = v.id_perteneciente
       WHERE v.id_profesional = $1
       ORDER BY p.id DESC`,
      [idProfesional],
    );
  }

  findByPerteneciente(idPerteneciente) {
    return BD.query(
      `SELECT pr.* FROM vinculos_profesional_perteneciente v
       JOIN profesionales pr ON pr.id = v.id_profesional
       WHERE v.id_perteneciente = $1
       ORDER BY pr.id DESC`,
      [idPerteneciente],
    );
  }
}

export default new VinculoProfesionalPertenecienteRepository();
