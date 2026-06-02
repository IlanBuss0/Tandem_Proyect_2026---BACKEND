class ParticipanteChat {
  constructor({
    id = null,
    id_chat,
    id_usuario,
    fecha_ingreso,
    fecha_salida = null,
    oculto_desde = null,
    es_admin = false,
  }) {
    this.id = id;
    this.id_chat = id_chat;
    this.id_usuario = id_usuario;
    this.fecha_ingreso = fecha_ingreso;
    this.fecha_salida = fecha_salida;
    this.oculto_desde = oculto_desde;
    this.es_admin = es_admin;
  }
}

export default ParticipanteChat;
