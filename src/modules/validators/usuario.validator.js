import AppError from '../errors/AppError.js';

export function validateCrearUsuario(data) {
  if (!data?.email || !data?.nombre) {
    throw new AppError('nombre y email son obligatorios', 400);
  }
}
