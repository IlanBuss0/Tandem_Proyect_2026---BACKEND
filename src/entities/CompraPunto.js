class CompraPunto {
  constructor({
    id = null,
    id_usuario,
    id_perteneciente,
    id_paquete_punto,
    id_estado_pago,
    comprobante_url = null,
    pagado = false,
    fecha_compra,
  }) {
    this.id = id;
    this.id_usuario = id_usuario;
    this.id_perteneciente = id_perteneciente;
    this.id_paquete_punto = id_paquete_punto;
    this.id_estado_pago = id_estado_pago;
    this.comprobante_url = comprobante_url;
    this.pagado = pagado;
    this.fecha_compra = fecha_compra;
  }
}

export default CompraPunto;
