class FavoritoActividad {
  constructor({
    id = null,
    id_perteneciente,
    id_actividad = null,
    id_actividad_personalizada = null,
    fecha_marcado,
  }) {
    this.id = id;
    this.id_perteneciente = id_perteneciente;
    this.id_actividad = id_actividad;
    this.id_actividad_personalizada = id_actividad_personalizada;
    this.fecha_marcado = fecha_marcado;
  }
}

export default FavoritoActividad;
