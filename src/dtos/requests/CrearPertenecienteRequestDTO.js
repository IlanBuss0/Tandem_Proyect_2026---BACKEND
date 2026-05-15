export default class CrearPertenecienteRequestDTO {
  constructor(data = {}) {
    this.id_usuario = data.id_usuario;
    this.id_nivel_apoyo = data.id_nivel_apoyo;
    this.id_autonomia_operativa = data.id_autonomia_operativa;
    this.puede_autogestionarse = data.puede_autogestionarse ?? false;
    this.observacion_general = data.observacion_general ?? null;
  }
}
