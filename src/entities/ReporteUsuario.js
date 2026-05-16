class ReporteUsuario {
  constructor({
    id = null,
    id_usuario_reportante,
    id_usuario_reportado = null,
    id_mensaje = null,
    id_archivo = null,
    id_estado_reporte,
    motivo,
    detalle = null,
    fecha_reporte,
  }) {
    this.id = id;
    this.id_usuario_reportante = id_usuario_reportante;
    this.id_usuario_reportado = id_usuario_reportado;
    this.id_mensaje = id_mensaje;
    this.id_archivo = id_archivo;
    this.id_estado_reporte = id_estado_reporte;
    this.motivo = motivo;
    this.detalle = detalle;
    this.fecha_reporte = fecha_reporte;
  }
}

export default ReporteUsuario;
