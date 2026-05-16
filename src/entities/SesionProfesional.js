class SesionProfesional {
  constructor({
    id = null,
    id_profesional,
    id_perteneciente,
    fecha_sesion,
    nota_sesion = null,
    recomendacion = null,
  }) {
    this.id = id;
    this.id_profesional = id_profesional;
    this.id_perteneciente = id_perteneciente;
    this.fecha_sesion = fecha_sesion;
    this.nota_sesion = nota_sesion;
    this.recomendacion = recomendacion;
  }
}

export default SesionProfesional;
