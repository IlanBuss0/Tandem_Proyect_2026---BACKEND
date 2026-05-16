class EventoZonaSegura {
  constructor({
    id = null,
    id_zona_segura,
    id_dispositivo,
    id_tipo_evento_zona_segura,
    fecha_evento,
  }) {
    this.id = id;
    this.id_zona_segura = id_zona_segura;
    this.id_dispositivo = id_dispositivo;
    this.id_tipo_evento_zona_segura = id_tipo_evento_zona_segura;
    this.fecha_evento = fecha_evento;
  }
}

export default EventoZonaSegura;
