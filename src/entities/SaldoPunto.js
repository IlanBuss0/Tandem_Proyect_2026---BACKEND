class SaldoPunto {
  constructor({
    id = null,
    id_perteneciente,
    saldo = 0,
  }) {
    this.id = id;
    this.id_perteneciente = id_perteneciente;
    this.saldo = saldo;
  }
}

export default SaldoPunto;
