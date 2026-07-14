class SesionProfesional {
  constructor({
    id = null,
    id_profesional,
    id_perteneciente,
    fecha_sesion,
    titulo = 'Sesion profesional',
    duracion_minutos = 60,
    estado = 'programada',
    recordatorios = [],
    legacy_calendar_event_id = null,
  }) {
    this.id = id;
    this.id_profesional = id_profesional;
    this.id_perteneciente = id_perteneciente;
    this.fecha_sesion = fecha_sesion;
    this.titulo = titulo;
    this.duracion_minutos = duracion_minutos;
    this.estado = estado;
    this.recordatorios = recordatorios;
    this.legacy_calendar_event_id = legacy_calendar_event_id;
  }
}

export default SesionProfesional;
