export default class UsuarioResponseDTO {
  constructor(usuario) {
    this.id = usuario.id;
    this.id_tipo_usuario = usuario.id_tipo_usuario;
    this.nombre_usuario = usuario.nombre_usuario;
    this.nombre = usuario.nombre;
    this.apellido = usuario.apellido;
    this.correo = usuario.correo;
    this.telefono = usuario.telefono;
    this.fecha_nacimiento = usuario.fecha_nacimiento;
    this.fecha_ingreso = usuario.fecha_ingreso;
    this.activo = usuario.activo;
  }
}
