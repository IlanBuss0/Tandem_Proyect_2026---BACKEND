import AppError from '../errors/AppError.js';

export function validateCrearUsuario(data) {
  if (!data?.id_tipo_usuario || !data?.nombre_usuario || !data?.contrasena_hash || !data?.nombre || !data?.apellido || !data?.correo || !data?.fecha_ingreso) {
    throw new AppError('id_tipo_usuario, nombre_usuario, contrasena_hash, nombre, apellido, correo y fecha_ingreso son obligatorios', 400);
  }
}
