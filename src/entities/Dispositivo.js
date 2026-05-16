class Dispositivo {
  constructor({
    id = null,
    id_usuario,
    nombre = null,
    identificador_dispositivo = null,
    activo = true,
    fecha_alta,
  }) {
    this.id = id;
    this.id_usuario = id_usuario;
    this.nombre = nombre;
    this.identificador_dispositivo = identificador_dispositivo;
    this.activo = activo;
    this.fecha_alta = fecha_alta;
  }
}

export default Dispositivo;
