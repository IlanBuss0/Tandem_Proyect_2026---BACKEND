import BaseCrudRepository from './BaseCrudRepository.js';
import BD from '../db/BD.js';

class VinculoTutorPertenecienteRepository extends BaseCrudRepository {
  constructor() { super('vinculos_tutor_pertenecientes', { softDelete: { field: 'fecha_fin' } }); }
  findByTutor(idTutor) { return BD.query('SELECT p.* FROM vinculos_tutor_pertenecientes v JOIN pertenecientes p ON p.id = v.id_perteneciente WHERE v.id_tutor = $1 ORDER BY p.id DESC', [idTutor]); }
  findByPerteneciente(idPerteneciente) { return BD.query('SELECT t.* FROM vinculos_tutor_pertenecientes v JOIN tutores t ON t.id = v.id_tutor WHERE v.id_perteneciente = $1 ORDER BY t.id DESC', [idPerteneciente]); }
}

export default new VinculoTutorPertenecienteRepository();
