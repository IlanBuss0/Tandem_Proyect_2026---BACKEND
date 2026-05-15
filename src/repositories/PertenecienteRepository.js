import BaseCrudRepository from './BaseCrudRepository.js';
import BD from '../db/BD.js';

class PertenecienteRepository extends BaseCrudRepository {
  constructor() {
    super('pertenecientes');
  }

  async safeQueryArray(sql, params = []) {
    try {
      return await BD.query(sql, params);
    } catch (error) {
      // Si una tabla/relación no existe todavía en el schema desplegado, no romper endpoint relacional.
      if (String(error.message || '').toLowerCase().includes('does not exist')) return [];
      throw error;
    }
  }

  findTutores(idPerteneciente) {
    return this.safeQueryArray(
      `SELECT t.*
       FROM vinculos_tutor_pertenecientes vtp
       JOIN tutores t ON t.id = vtp.id_tutor
       WHERE vtp.id_perteneciente = $1
       ORDER BY t.id DESC`,
      [idPerteneciente],
    );
  }

  findProfesionales(idPerteneciente) {
    return this.safeQueryArray(
      `SELECT p.*
       FROM vinculos_profesional_pertenecientes vpp
       JOIN profesionales p ON p.id = vpp.id_profesional
       WHERE vpp.id_perteneciente = $1
       ORDER BY p.id DESC`,
      [idPerteneciente],
    );
  }

  findActividades(idPerteneciente) {
    return this.safeQueryArray('SELECT * FROM actividades_asignadas WHERE id_perteneciente = $1 ORDER BY id DESC', [idPerteneciente]);
  }

  findRutinas(idPerteneciente) {
    // En el schema actual no hay tabla rutinas explícita; se usa actividades_asignadas como fuente temporal.
    return this.safeQueryArray('SELECT * FROM actividades_asignadas WHERE id_perteneciente = $1 ORDER BY id DESC', [idPerteneciente]);
  }

  findEventos(idPerteneciente) {
    // En el schema actual se mapea eventos a sesiones_profesionales.
    return this.safeQueryArray('SELECT * FROM sesiones_profesionales WHERE id_perteneciente = $1 ORDER BY fecha_sesion ASC', [idPerteneciente]);
  }

  findEmociones(idPerteneciente) {
    // En el schema actual se mapea emociones a evaluaciones_autonomias.
    return this.safeQueryArray('SELECT * FROM evaluaciones_autonomias WHERE id_perteneciente = $1 ORDER BY id DESC', [idPerteneciente]);
  }

  findObjetivos(idPerteneciente) {
    // En el schema actual no hay tabla objetivos explícita; devolución temporal desde actividades_asignadas.
    return this.safeQueryArray('SELECT * FROM actividades_asignadas WHERE id_perteneciente = $1 ORDER BY id DESC', [idPerteneciente]);
  }

  findUbicaciones(idPerteneciente) {
    return this.safeQueryArray(
      `SELECT uh.*
       FROM ubicaciones_historiales uh
       JOIN dispositivos d ON d.id = uh.id_dispositivo
       JOIN pertenecientes p ON p.id_usuario = d.id_usuario
       WHERE p.id = $1
       ORDER BY uh.id DESC`,
      [idPerteneciente],
    );
  }

  findNotificaciones(idPerteneciente) {
    return this.safeQueryArray(
      `SELECT n.*
       FROM notificaciones n
       JOIN pertenecientes p ON p.id_usuario = n.id_usuario_destino
       WHERE p.id = $1
       ORDER BY n.id DESC`,
      [idPerteneciente],
    );
  }
}

export default new PertenecienteRepository();
