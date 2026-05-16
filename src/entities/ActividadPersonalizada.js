class ActividadPersonalizada {
  constructor({
    id = null,
    id_actividad_base = null,
    id_tipo_actividad,
    id_punto_otorgado,
    id_usuario_creador,
    titulo,
    descripcion = null,
    fecha_creacion,
    activa = true,
  }) {
    this.id = id;
    this.id_actividad_base = id_actividad_base;
    this.id_tipo_actividad = id_tipo_actividad;
    this.id_punto_otorgado = id_punto_otorgado;
    this.id_usuario_creador = id_usuario_creador;
    this.titulo = titulo;
    this.descripcion = descripcion;
    this.fecha_creacion = fecha_creacion;
    this.activa = activa;
  }
}

export default ActividadPersonalizada;
