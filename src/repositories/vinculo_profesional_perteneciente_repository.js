import BaseCrudRepository from './BaseCrudRepository.js';
import BD from '../db/BD.js';

class VinculoProfesionalPertenecienteRepository extends BaseCrudRepository {
  constructor() { super('vinculos_profesional_pertenecientes', { softDelete: { field: 'fecha_fin' } }); }
  findByProfesional(idProfesional) { return BD.query('SELECT p.* FROM vinculos_profesional_pertenecientes v JOIN pertenecientes p ON p.id = v.id_perteneciente WHERE v.id_profesional = $1 ORDER BY p.id DESC', [idProfesional]); }
  findByPerteneciente(idPerteneciente) { return BD.query('SELECT pr.* FROM vinculos_profesional_pertenecientes v JOIN profesionales pr ON pr.id = v.id_profesional WHERE v.id_perteneciente = $1 ORDER BY pr.id DESC', [idPerteneciente]); }
}

export default new VinculoProfesionalPertenecienteRepository();
