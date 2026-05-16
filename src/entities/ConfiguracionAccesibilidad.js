class ConfiguracionAccesibilidad {
  constructor({
    id = null,
    id_usuario,
    clave,
    valor,
    fecha_modificacion,
  }) {
    this.id = id;
    this.id_usuario = id_usuario;
    this.clave = clave;
    this.valor = valor;
    this.fecha_modificacion = fecha_modificacion;
  }
}

export default ConfiguracionAccesibilidad;
