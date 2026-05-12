export default class UsuarioResponseDTO {
  constructor(usuario) {
    this.id = usuario.id;
    this.nombre = usuario.nombre;
    this.email = usuario.email;
  }
}
