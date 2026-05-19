export default class CrearUsuarioRequestDTO {
  constructor({
    id_tipo_usuario,
    nombre_usuario,
    contrasena_hash,
    nombre,
    apellido,
    correo,
    telefono,
    fecha_nacimiento,
    fecha_ingreso,
    activo,
  }) {
    this.id_tipo_usuario = id_tipo_usuario;
    this.nombre_usuario = nombre_usuario;
    this.contrasena_hash = contrasena_hash;
    this.nombre = nombre;
    this.apellido = apellido;
    this.correo = correo;
    this.telefono = telefono;
    this.fecha_nacimiento = fecha_nacimiento;
    this.fecha_ingreso = fecha_ingreso;
    this.activo = activo;
  }
}
