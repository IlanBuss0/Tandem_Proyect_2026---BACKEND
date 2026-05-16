class Actividad {
  constructor({
    id = null,
    id_tipo_actividad,
    id_punto_otorgado,
    titulo,
    descripcion = null,
    es_integrada = false,
    activa = true,
  }) {
    this.id = id;
    this.id_tipo_actividad = id_tipo_actividad;
    this.id_punto_otorgado = id_punto_otorgado;
    this.titulo = titulo;
    this.descripcion = descripcion;
    this.es_integrada = es_integrada;
    this.activa = activa;
  }
}

export default Actividad;
