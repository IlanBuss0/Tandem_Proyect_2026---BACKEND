class ParticipanteChat {
  constructor({
    id = null,
    id_chat,
    id_usuario,
    fecha_ingreso,
    fecha_salida = null,
  }) {
    this.id = id;
    this.id_chat = id_chat;
    this.id_usuario = id_usuario;
    this.fecha_ingreso = fecha_ingreso;
    this.fecha_salida = fecha_salida;
  }
}

export default ParticipanteChat;
