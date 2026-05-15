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

  findByPerteneciente(idPerteneciente) {
    return BD.query('SELECT * FROM actividades WHERE id_perteneciente = $1 ORDER BY id DESC', [idPerteneciente]);
  }

  findBase() {
    return BD.query('SELECT * FROM actividades WHERE (es_base = true OR tipo = $1) ORDER BY id DESC', ['base']);
  }

  findPersonalizadas() {
    return BD.query('SELECT * FROM actividades WHERE (es_base = false OR tipo = $1) ORDER BY id DESC', ['personalizada']);
  }

  findByCategoria(categoria) {
    return BD.query('SELECT * FROM actividades WHERE categoria = $1 ORDER BY id DESC', [categoria]);
  }

  findByTipo(tipo) {
    return BD.query('SELECT * FROM actividades WHERE tipo = $1 ORDER BY id DESC', [tipo]);
  }
}

export default new ActividadRepository();
