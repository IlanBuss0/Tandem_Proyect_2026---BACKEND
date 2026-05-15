import BD from '../db/BD.js';

class VinculoTutorPertenecienteRepository {
  findAll() {
    return BD.query('SELECT * FROM vinculos_tutor_perteneciente ORDER BY id DESC');
  }

  create(data) {
    const entries = Object.entries(data).filter(([, v]) => v !== undefined);
    const fields = entries.map(([k]) => k);
    const values = entries.map(([, v]) => v);
    const placeholders = fields.map((_, i) => `$${i + 1}`);
    return BD.queryOne(`INSERT INTO vinculos_tutor_perteneciente (${fields.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`, values);
  }

  async remove(id) {
    const count = await BD.execute('DELETE FROM vinculos_tutor_perteneciente WHERE id = $1', [id]);
    return count > 0;
  }

  findByTutor(idTutor) {
    return BD.query(
      `SELECT p.* FROM vinculos_tutor_perteneciente v
       JOIN pertenecientes p ON p.id = v.id_perteneciente
       WHERE v.id_tutor = $1
       ORDER BY p.id DESC`,
      [idTutor],
    );
  }

  findByPerteneciente(idPerteneciente) {
    return BD.query(
      `SELECT t.* FROM vinculos_tutor_perteneciente v
       JOIN tutores t ON t.id = v.id_tutor
       WHERE v.id_perteneciente = $1
       ORDER BY t.id DESC`,
      [idPerteneciente],
    );
  }
}

export default new VinculoTutorPertenecienteRepository();
