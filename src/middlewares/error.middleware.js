export function errorMiddleware(error, req, res, next) {
  const status = error.statusCode || 500;
  res.status(status).json({
    ok: false,
    message: error.message || 'Error interno del servidor',
  });
}
