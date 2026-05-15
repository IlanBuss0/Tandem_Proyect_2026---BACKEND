class Profesional {
  constructor({
    id = null,
    id_usuario,
    profesion,
    especialidad = null,
    matricula,
    institucion = null,
    id_estado_validacion,
  }) {
    this.id = id;
    this.id_usuario = id_usuario;
    this.profesion = profesion;
    this.especialidad = especialidad;
    this.matricula = matricula;
    this.institucion = institucion;
    this.id_estado_validacion = id_estado_validacion;
  }
}

export default Profesional;
