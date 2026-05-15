import BaseCrudRepository from './BaseCrudRepository.js';
import BD from '../db/BD.js';

class ActividadRepository extends BaseCrudRepository {
  constructor() {
    super('actividades', { softDelete: { field: 'activa' } });
  }

  findByPerteneciente(idPerteneciente) {
    return BD.query('SELECT * FROM actividades_asignadas WHERE id_perteneciente = $1 ORDER BY id DESC', [idPerteneciente]);
  }

  findBase() {
    return BD.query('SELECT * FROM actividades WHERE es_integrada = true ORDER BY id DESC');
  }

  findPersonalizadas() {
    return BD.query('SELECT * FROM actividades_personalizadas ORDER BY id DESC');
  }

  findByCategoria(idTipoActividad) {
    return BD.query('SELECT * FROM actividades WHERE id_tipo_actividad = $1 ORDER BY id DESC', [idTipoActividad]);
  }

  findByTipo(idTipoActividad) {
    return this.findByCategoria(idTipoActividad);
  }
}

export default new ActividadRepository();
