class Chat {
  constructor({
    id = null,
    id_tipo_chat,
    nombre = null,
    descripcion = null,
    fecha_creacion,
    activo = true,
  }) {
    this.id = id;
    this.id_tipo_chat = id_tipo_chat;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.fecha_creacion = fecha_creacion;
    this.activo = activo;
  }
}

export default Chat;
