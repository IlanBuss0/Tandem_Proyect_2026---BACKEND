class Mensaje {
  constructor({
    id = null,
    id_chat,
    id_usuario_emisor,
    id_tipo_mensaje,
    contenido = null,
    fecha_envio,
    eliminado = false,
  }) {
    this.id = id;
    this.id_chat = id_chat;
    this.id_usuario_emisor = id_usuario_emisor;
    this.id_tipo_mensaje = id_tipo_mensaje;
    this.contenido = contenido;
    this.fecha_envio = fecha_envio;
    this.eliminado = eliminado;
  }
}

export default Mensaje;
