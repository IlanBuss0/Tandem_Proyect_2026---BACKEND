class Notificacion {
  constructor({
    id = null,
    id_usuario_destino,
    id_usuario_actor = null,
    id_tipo_notificacion,
    titulo,
    cuerpo = null,
    leida = false,
    fecha_creacion,
    fecha_lectura = null,
  }) {
    this.id = id;
    this.id_usuario_destino = id_usuario_destino;
    this.id_usuario_actor = id_usuario_actor;
    this.id_tipo_notificacion = id_tipo_notificacion;
    this.titulo = titulo;
    this.cuerpo = cuerpo;
    this.leida = leida;
    this.fecha_creacion = fecha_creacion;
    this.fecha_lectura = fecha_lectura;
  }
}

export default Notificacion;
