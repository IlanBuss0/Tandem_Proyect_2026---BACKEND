class ActividadAsignada {
  constructor({
    id = null,
    id_actividad = null,
    id_actividad_personalizada = null,
    id_perteneciente,
    id_usuario_asignador,
    id_estado_actividad,
    fecha_asignacion,
    fecha_completada = null,
  }) {
    this.id = id;
    this.id_actividad = id_actividad;
    this.id_actividad_personalizada = id_actividad_personalizada;
    this.id_perteneciente = id_perteneciente;
    this.id_usuario_asignador = id_usuario_asignador;
    this.id_estado_actividad = id_estado_actividad;
    this.fecha_asignacion = fecha_asignacion;
    this.fecha_completada = fecha_completada;
  }
}

export default ActividadAsignada;
