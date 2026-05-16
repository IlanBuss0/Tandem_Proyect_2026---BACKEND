class UbicacionActual {
  constructor({
    id = null,
    id_dispositivo,
    latitud,
    longitud,
    fecha_registro,
  }) {
    this.id = id;
    this.id_dispositivo = id_dispositivo;
    this.latitud = latitud;
    this.longitud = longitud;
    this.fecha_registro = fecha_registro;
  }
}

export default UbicacionActual;
