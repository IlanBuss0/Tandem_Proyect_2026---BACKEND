class Administrador {
  constructor({
    id = null,
    id_usuario,
    id_rol,
  }) {
    this.id = id;
    this.id_usuario = id_usuario;
    this.id_rol = id_rol;
  }
}

export default Administrador;
