class Contacto {
  constructor({
    id = null,
    id_usuario_menor,
    id_usuario_mayor,
    id_usuario_solicitante,
    id_estado_contacto,
    fecha_solicitud,
    fecha_resolucion = null,
  }) {
    this.id = id;
    this.id_usuario_menor = id_usuario_menor;
    this.id_usuario_mayor = id_usuario_mayor;
    this.id_usuario_solicitante = id_usuario_solicitante;
    this.id_estado_contacto = id_estado_contacto;
    this.fecha_solicitud = fecha_solicitud;
    this.fecha_resolucion = fecha_resolucion;
  }
}

export default Contacto;
