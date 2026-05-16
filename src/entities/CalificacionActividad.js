class CalificacionActividad {
  constructor({
    id = null,
    id_perteneciente,
    id_actividad = null,
    id_actividad_personalizada = null,
    puntaje_usuario,
    id_dificultad_actividad = null,
    fecha_calificacion,
  }) {
    this.id = id;
    this.id_perteneciente = id_perteneciente;
    this.id_actividad = id_actividad;
    this.id_actividad_personalizada = id_actividad_personalizada;
    this.puntaje_usuario = puntaje_usuario;
    this.id_dificultad_actividad = id_dificultad_actividad;
    this.fecha_calificacion = fecha_calificacion;
  }
}

export default CalificacionActividad;
