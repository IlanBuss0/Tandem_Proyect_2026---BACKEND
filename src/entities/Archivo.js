class Archivo {
  constructor({
    id = null,
    id_usuario_creador = null,
    id_tipo_archivo = null,
    nombre_archivo = null,
    url = null,
    fecha_subida = null,
    activo = true,
  } = {}) {
    this.id = id;
    this.id_usuario_creador = id_usuario_creador;
    this.id_tipo_archivo = id_tipo_archivo;
    this.nombre_archivo = nombre_archivo;
    this.url = url;
    this.fecha_subida = fecha_subida;
    this.activo = activo;
  }
}

export default Archivo;
