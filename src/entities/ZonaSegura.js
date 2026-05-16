class ZonaSegura {
  constructor({
    id = null,
    id_perteneciente,
    id_tutor_creador,
    nombre,
    latitud,
    longitud,
    radio_metro,
    notificar_entrada = true,
    notificar_salida = false,
    activa = true,
  }) {
    this.id = id;
    this.id_perteneciente = id_perteneciente;
    this.id_tutor_creador = id_tutor_creador;
    this.nombre = nombre;
    this.latitud = latitud;
    this.longitud = longitud;
    this.radio_metro = radio_metro;
    this.notificar_entrada = notificar_entrada;
    this.notificar_salida = notificar_salida;
    this.activa = activa;
  }
}

export default ZonaSegura;
