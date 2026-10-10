import AuthorizationService from '../../services/AuthorizationService.js';
import AuthorizationRepository from '../../repositories/AuthorizationRepository.js';
import AppError from '../errors/AppError.js';

// Los ids de usuario que el que llama puede leer: el suyo propio, mas los
// pertenecientes que tutela o atiende como profesional. Reusa
// getPermissionContext (ya cacheado 60s) en vez de armar SQL nueva.
export async function getReadableUsuarioIdsAsync(idUsuario) {
  const context = await AuthorizationService.getPermissionContext(idUsuario);
  const ids = new Set([Number(idUsuario)]);
  for (const p of context.pertenecientes || []) {
    if (p.usuario?.id) ids.add(Number(p.usuario.id));
  }
  for (const v of context.vinculos || []) {
    if (v.perteneciente?.usuario?.id) ids.add(Number(v.perteneciente.usuario.id));
  }
  return ids;
}

// Escritura de una configuracion sin permiso de perteneciente asociado: solo
// el dueño, o un tutor con vinculo activo de ese perteneciente. Cualquier otro
// caso es 403 (tambien si el dueño no es perteneciente, para no revelar nada).
export async function assertCanWriteUsuarioConfigAsync(idUsuarioActor, idUsuarioTarget) {
  if (!Number.isInteger(Number(idUsuarioTarget))) throw new AppError('id_usuario invalido', 400);
  if (Number(idUsuarioActor) === Number(idUsuarioTarget)) return;

  const perteneciente = await AuthorizationRepository.getPertenecienteByUsuarioId(idUsuarioTarget);
  if (!perteneciente) throw new AppError('No autorizado para modificar este recurso', 403);

  await AuthorizationService.assertCanWritePertenecienteResource(idUsuarioActor, perteneciente.id, {
    allowTutor: true,
  });
}
