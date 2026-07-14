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
    recurrence_group_id = null,
    recurrence_rule = null,
    recurrence_index = 0,
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
    this.recurrence_group_id = recurrence_group_id;
    this.recurrence_rule = recurrence_rule;
    this.recurrence_index = recurrence_index;
  }
}

export default SesionProfesional;
