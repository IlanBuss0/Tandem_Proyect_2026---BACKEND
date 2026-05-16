class MovimientoPunto {
  constructor({
    id = null,
    id_perteneciente,
    id_tipo_movimiento_punto,
    cantidad,
    descripcion = null,
    fecha_movimiento,
  }) {
    this.id = id;
    this.id_perteneciente = id_perteneciente;
    this.id_tipo_movimiento_punto = id_tipo_movimiento_punto;
    this.cantidad = cantidad;
    this.descripcion = descripcion;
    this.fecha_movimiento = fecha_movimiento;
  }
}

export default MovimientoPunto;
