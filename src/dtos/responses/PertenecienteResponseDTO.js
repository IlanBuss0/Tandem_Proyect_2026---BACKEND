export default class PertenecienteResponseDTO {
  constructor(row) {
    this.id = row.id;
    this.id_usuario = row.id_usuario;
    this.id_nivel_apoyo = row.id_nivel_apoyo;
    this.id_autonomia_operativa = row.id_autonomia_operativa;
    this.puede_autogestionarse = row.puede_autogestionarse;
    this.observacion_general = row.observacion_general;
  }
}
