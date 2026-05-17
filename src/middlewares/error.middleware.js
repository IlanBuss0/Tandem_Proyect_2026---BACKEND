import { StatusCodes } from 'http-status-codes';
import AppError from '../modules/errors/AppError.js';

export function errorMiddleware(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  console.error('Error no manejado:', err);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Error interno del servidor.' });
}
