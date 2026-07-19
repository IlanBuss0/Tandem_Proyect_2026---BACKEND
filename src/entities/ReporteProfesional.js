class ReporteProfesional {
  constructor({
    id = null,
    id_profesional,
    id_perteneciente,
    titulo,
    contenido,
    id_tipo = 'manual',
    fecha_generacion = null,
    enviado_al_tutor = false,
    fecha_envio = null,
  }) {
    this.id = id;
    this.id_profesional = id_profesional;
    this.id_perteneciente = id_perteneciente;
    this.titulo = titulo;
    this.contenido = contenido;
    this.id_tipo = id_tipo;
    this.fecha_generacion = fecha_generacion;
    this.enviado_al_tutor = enviado_al_tutor;
    this.fecha_envio = fecha_envio;
  }
}

export default ReporteProfesional;
