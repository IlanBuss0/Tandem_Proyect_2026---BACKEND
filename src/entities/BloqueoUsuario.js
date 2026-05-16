class BloqueoUsuario {
  constructor({
    id = null,
    id_usuario_bloqueador,
    id_usuario_bloqueado,
    motivo = null,
    activo = true,
    fecha_bloqueo,
  }) {
    this.id = id;
    this.id_usuario_bloqueador = id_usuario_bloqueador;
    this.id_usuario_bloqueado = id_usuario_bloqueado;
    this.motivo = motivo;
    this.activo = activo;
    this.fecha_bloqueo = fecha_bloqueo;
  }
}

export default BloqueoUsuario;
