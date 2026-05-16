class EvaluacionAutonomia {
  constructor({
    id = null,
    id_perteneciente,
    id_profesional = null,
    id_nivel_apoyo_anterior = null,
    id_nivel_apoyo_nuevo,
    id_autonomia_operativa_anterior = null,
    id_autonomia_operativa_nueva,
    puede_autogestionarse_nuevo,
    observacion = null,
    fecha_evaluacion,
  }) {
    this.id = id;
    this.id_perteneciente = id_perteneciente;
    this.id_profesional = id_profesional;
    this.id_nivel_apoyo_anterior = id_nivel_apoyo_anterior;
    this.id_nivel_apoyo_nuevo = id_nivel_apoyo_nuevo;
    this.id_autonomia_operativa_anterior = id_autonomia_operativa_anterior;
    this.id_autonomia_operativa_nueva = id_autonomia_operativa_nueva;
    this.puede_autogestionarse_nuevo = puede_autogestionarse_nuevo;
    this.observacion = observacion;
    this.fecha_evaluacion = fecha_evaluacion;
  }
}

export default EvaluacionAutonomia;
