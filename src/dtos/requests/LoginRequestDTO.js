export default class LoginRequestDTO {
  constructor({ correo, nombre_usuario, contrasena }) {
    this.correo = correo;
    this.nombre_usuario = nombre_usuario;
    this.contrasena = contrasena;
  }
}
