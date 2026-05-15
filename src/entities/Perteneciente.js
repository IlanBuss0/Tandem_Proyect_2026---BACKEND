class Perteneciente {
  constructor({
    id = null,
    id_usuario,
    id_nivel_apoyo,
    id_autonomia_operativa,
    puede_autogestionarse = false,
    observacion_general = null,
  }) {
    this.id = id;
    this.id_usuario = id_usuario;
    this.id_nivel_apoyo = id_nivel_apoyo;
    this.id_autonomia_operativa = id_autonomia_operativa;
    this.puede_autogestionarse = puede_autogestionarse;
    this.observacion_general = observacion_general;
  }
}

export default Perteneciente;
