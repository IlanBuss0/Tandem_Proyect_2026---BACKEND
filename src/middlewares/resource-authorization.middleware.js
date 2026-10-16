import BD from '../db/BD.js';
import AuthorizationService from '../services/AuthorizationService.js';
import AuthorizationRepository from '../repositories/AuthorizationRepository.js';
import AppError from '../modules/errors/AppError.js';
import { AUTH_ACTIONS, PERTENECIENTE_PERMISSIONS, PROFESIONAL_PERMISSIONS } from '../modules/security/permissions.constants.js';

const readMethods = new Set(['GET', 'HEAD']);
const catalogs = new Set([
  'actividades', 'alcances-archivos', 'autonomias-operativas', 'catalogos-permisos-pertenecientes',
  'catalogos-permisos-profesionales', 'dificultades-actividades', 'entidades-afectadas-auditorias',
  'estados-actividades', 'estados-contactos', 'estados-pagos', 'estados-reportes',
  'estados-suscripciones', 'estados-validaciones-profesionales', 'estados-vinculos',
  'niveles-apoyos', 'planes-suscripciones', 'roles-administradores', 'tipos-actividades',
  'tipos-archivos', 'tipos-chats', 'tipos-eventos-auditorias', 'tipos-eventos-zonas-seguras',
  'tipos-items-avatares', 'tipos-mensajes', 'tipos-movimientos-puntos', 'tipos-notificaciones',
  'tipos-permisos-archivos', 'tipos-usuarios', 'items-avatares', 'paquetes-puntos', 'puntos-otorgados',
]);

export const CATALOG_RESOURCES = Object.freeze([...catalogs]);

// Only identifiers from this fixed registry are interpolated into SQL.
export const RESOURCE_POLICIES = Object.freeze({
  archivos: ['archivos', 'file'],
  avatares: ['avatares', 'belonging', 'id_perteneciente'],
  'inventarios-avatares': ['inventarios_avatares', 'inventory'],
  'eventos-zonas-seguras': ['eventos_zonas_seguras', 'zoneEvent'],
  'calificaciones-actividades': ['calificaciones_actividades', 'belonging', 'id_perteneciente'],
  'favoritos-actividades': ['favoritos_actividades', 'belonging', 'id_perteneciente'],
  'saldos-puntos': ['saldos_puntos', 'belonging', 'id_perteneciente', 'system'],
  'movimientos-puntos': ['movimientos_puntos', 'belonging', 'id_perteneciente', 'system'],
  'compras-puntos': ['compras_puntos', 'user', 'id_usuario', 'system'],
  'auditorias-eventos': ['auditorias_eventos', 'admin', null, 'system'],
  'pagos-suscripciones': ['pagos_suscripciones', 'admin', null, 'system'],
  'beneficiarios-suscripciones': ['beneficiarios_suscripciones', 'user', 'id_usuario_beneficiario', 'system'],
  'permisos-archivos': ['permisos_archivos', 'filePermission', null, 'system'],
  'mensajes-archivos': ['mensajes_archivos', 'attachment', null, 'system'],
  'permisos-otorgados-pertenecientes': ['permisos_otorgados_pertenecientes', 'belongingPermission', 'id_perteneciente'],
  'permisos-otorgados-profesionales': ['permisos_otorgados_profesionales', 'professionalPermission', 'id_vinculo_profesional_perteneciente'],
  'historiales-permisos-otorgados-pertenecientes': ['historial_permisos_otorgados_pertenecientes', 'belongingPermission', 'id_perteneciente', 'system'],
  'historiales-permisos-otorgados-profesionales': ['historial_permisos_otorgados_profesionales', 'professionalPermission', 'id_vinculo_profesional_perteneciente', 'system'],
  'vinculos-tutor-pertenecientes': ['vinculos_tutor_pertenecientes', 'tutorLink', 'id_perteneciente'],
  contactos: ['contactos', 'contact'],
  tutores: ['tutores', 'tutor'],
});

export function assertAdmin(req) {
  if (Number(req.account?.id_tipo_usuario) !== 4) throw new AppError('Se requiere una cuenta administradora.', 403);
}

export async function assertResourceRead(req, policy, row) {
  if (Number(req.account?.id_tipo_usuario) === 4) return;
  const [, kind, owner] = policy;
  const id = Number(req.user.id);
  if (kind === 'admin') throw new AppError('No autorizado.', 403);
  if (kind === 'file') return AuthorizationService.assertCanReadFile(id, row);
  if (kind === 'user' && Number(row[owner]) === id) return;
  if (kind === 'contact' && [row.id_usuario_menor, row.id_usuario_mayor].map(Number).includes(id)) return;
  if (kind === 'belonging') return AuthorizationService.assertCanReadPertenecienteResource(id, Number(row[owner]), PROFESIONAL_PERMISSIONS.VER_HISTORIAL);
  if (kind === 'belongingPermission') return AuthorizationService.assertCanReadPertenecientePermissions(id, Number(row[owner]));
  if (kind === 'professionalPermission') return AuthorizationService.assertCanReadProfesionalPermissions(id, Number(row[owner]));
  if (kind === 'filePermission') {
    const file = await BD.queryOne('SELECT * FROM archivos WHERE id = $1', [row.id_archivo]);
    if (file && Number(file.id_usuario_creador) === id) return;
  }
  if (kind === 'attachment') {
    const member = await BD.queryOne(`SELECT pc.id FROM mensajes m JOIN participantes_chats pc ON pc.id_chat = m.id_chat
      WHERE m.id = $1 AND pc.id_usuario = $2 AND pc.fecha_salida IS NULL AND m.eliminado = false
        AND (pc.oculto_desde IS NULL OR m.fecha_envio >= pc.oculto_desde)`, [row.id_mensaje, id]);
    if (member) return;
  }
  if (kind === 'inventory') {
    const avatar = await BD.queryOne('SELECT * FROM avatares WHERE id = $1', [row.id_avatar]);
    if (avatar) return AuthorizationService.assertCanReadPertenecienteResource(id, Number(avatar.id_perteneciente), PROFESIONAL_PERMISSIONS.VER_HISTORIAL);
  }
  if (kind === 'zoneEvent') {
    await AuthorizationService.assertCanAccessZonaSegura(id, Number(row.id_zona_segura), 'read');
    return AuthorizationService.assertCanAccessDispositivoLocation(id, Number(row.id_dispositivo), 'read');
  }
  if (kind === 'tutorLink') {
    const context = await AuthorizationService.getUserContext(id);
    if (Number(context?.tutor?.id) === Number(row.id_tutor) && !row.fecha_fin) return;
    return AuthorizationService.assertCanReadPertenecienteResource(id, Number(row.id_perteneciente));
  }
  if (kind === 'tutor') {
    if (Number(row.id_usuario) === id) return;
    const relation = await BD.queryOne(`SELECT v.id FROM vinculos_tutor_pertenecientes v JOIN pertenecientes p ON p.id=v.id_perteneciente
      WHERE v.id_tutor=$1 AND p.id_usuario=$2 AND v.fecha_fin IS NULL`, [row.id, id]);
    if (relation) {
      const context = await AuthorizationService.getUserContext(row.id_usuario);
      const target = await AuthorizationRepository.getPertenecienteByUsuarioId(id);
      if ((await AuthorizationService.canTutorActOnPerteneciente(context, { id_perteneciente: target?.id })).allowed) return;
    }
  }
  throw new AppError('No autorizado para acceder a este recurso.', 403);
}

export async function filterResourceRows(req, policy, rows) {
  const visible = [];
  for (const row of rows) {
    try { await assertResourceRead(req, policy, row); visible.push(row); }
    catch (error) { if (![403, 404].includes(error.statusCode)) throw error; }
  }
  return visible;
}

async function assertWrite(req, resource, policy, previous) {
  const [, kind, owner, mode] = policy;
  if (mode === 'system') return assertAdmin(req);
  if (kind === 'tutorLink') {
    // New links must be accepted through the existing invitation flow.
    if (!previous) throw new AppError('Usa el flujo de invitaciones para crear vinculos.', 403);
    await AuthorizationService.assertCan(req.user.id, AUTH_ACTIONS.TUTOR_PERMISOS_MODIFICAR, { id_perteneciente: Number(previous.id_perteneciente) });
    if (req.method !== 'DELETE') req.body = { ...previous, fecha_fin: req.body?.fecha_fin ?? previous.fecha_fin };
    return;
  }
  const row = previous || req.body || {};
  if (kind === 'file') {
    if (resource === 'archivos' && req.path.endsWith('/upload')) return;
    if (Number(row.id_usuario_creador) !== Number(req.user.id)) throw new AppError('Solo el creador puede modificar el archivo.', 403);
    if (previous && req.method !== 'DELETE') req.body = { ...previous, nombre_archivo: req.body?.nombre_archivo ?? previous.nombre_archivo };
    return;
  }
  if (kind === 'belonging') {
    await AuthorizationService.assertCanWritePertenecienteResource(req.user.id, Number(row[owner]), { pertenecientePermissionName: PERTENECIENTE_PERMISSIONS.EDITAR_PERFIL });
    if (previous) {
      req.body = { ...req.body, [owner]: previous[owner] };
      if (resource === 'avatares') req.body = { ...previous, avatar_json: req.body.avatar_json ?? previous.avatar_json, avatar_imagen_origen_url: req.body.avatar_imagen_origen_url ?? previous.avatar_imagen_origen_url };
    } else if (resource === 'avatares') req.body = { id_perteneciente: Number(row[owner]), avatar_json: row.avatar_json, avatar_imagen_origen_url: row.avatar_imagen_origen_url };
    return;
  }
  if (kind === 'inventory') {
    const avatar = await BD.queryOne('SELECT * FROM avatares WHERE id=$1', [row.id_avatar]);
    if (!avatar) throw new AppError('Avatar no encontrado.', 404);
    await AuthorizationService.assertCanWritePertenecienteResource(req.user.id, Number(avatar.id_perteneciente), { pertenecientePermissionName: previous ? PERTENECIENTE_PERMISSIONS.EDITAR_PERFIL : PERTENECIENTE_PERMISSIONS.GASTAR_PUNTOS, allowTutor: false });
    if (previous) req.body = { ...previous, equipado: req.body?.equipado === true };
    return;
  }
  if (kind === 'zoneEvent') {
    await AuthorizationService.assertCanAccessZonaSegura(req.user.id, Number(row.id_zona_segura), 'write');
    await AuthorizationService.assertCanAccessDispositivoLocation(req.user.id, Number(row.id_dispositivo), 'write');
    if (previous) req.body = { ...req.body, id_zona_segura: previous.id_zona_segura, id_dispositivo: previous.id_dispositivo };
    return;
  }
  if (kind === 'contact') {
    const ids = [row.id_usuario_menor, row.id_usuario_mayor].map(Number);
    if (!ids.includes(Number(req.user.id)) || ids[0] === ids[1]) throw new AppError('No autorizado para administrar este contacto.', 403);
    if (previous) {
      // Only the recipient can accept; participants and initiator are immutable.
      if (Number(previous.id_usuario_solicitante) === Number(req.user.id) && req.method !== 'DELETE') throw new AppError('Solo el destinatario puede responder.', 403);
      req.body = { ...previous, id_estado_contacto: req.body?.id_estado_contacto ?? previous.id_estado_contacto };
    } else {
      const pending = await BD.queryOne("SELECT id FROM estados_contactos WHERE LOWER(nombre) IN ('pendiente','solicitado') ORDER BY id LIMIT 1");
      if (!pending) throw new AppError('Estado inicial de contacto no configurado.', 500);
      req.body = { ...row, id_usuario_solicitante: req.user.id, id_estado_contacto: pending.id };
    }
    return;
  }
  if (['belongingPermission', 'professionalPermission', 'tutor'].includes(kind)) return; // Existing controller checks writes.
  await assertResourceRead(req, policy, row);
  if (previous && owner) req.body = { ...req.body, [owner]: previous[owner] };
}

export async function resourceAuthorizationMiddleware(req, res, next) {
  try {
    const parts = req.path.split('/').filter(Boolean).map(decodeURIComponent);
    const resource = parts[0]?.toLowerCase();
    const identifier = parts[1];
    if (catalogs.has(resource)) {
      if (!readMethods.has(req.method)) assertAdmin(req);
      req.resourceAuthorizationPolicy = { catalog: true };
      return next();
    }
    const policy = RESOURCE_POLICIES[resource];
    if (!policy) return next();
    req.resourceAuthorizationPolicy = policy;
    const special = { archivos: ['upload'], tutores: ['usuario'], 'vinculos-tutor-pertenecientes': ['tutor', 'perteneciente'] };
    if (identifier && !/^[1-9]\d*$/.test(identifier) && !special[resource]?.includes(identifier.toLowerCase())) throw new AppError('Identificador invalido.', 400);
    if (readMethods.has(req.method)) {
      if (identifier && /^\d+$/.test(identifier)) {
        const row = await BD.queryOne(`SELECT * FROM ${policy[0]} WHERE id=$1`, [Number(identifier)]);
        if (!row) throw new AppError('Recurso no encontrado.', 404);
        await assertResourceRead(req, policy, row);
      } else {
        const sendJson = res.json.bind(res);
        res.json = (data) => {
          if (res.statusCode >= 400 || data == null) return sendJson(data);
          if (Array.isArray(data)) filterResourceRows(req, policy, data).then(sendJson).catch(next);
          else if (data.id != null) assertResourceRead(req, policy, data).then(() => sendJson(data)).catch(next);
          else return sendJson(data);
          return res;
        };
      }
    } else {
      const previous = identifier && /^\d+$/.test(identifier)
        ? await BD.queryOne(`SELECT * FROM ${policy[0]} WHERE id=$1`, [Number(identifier)]) : null;
      if (identifier && /^\d+$/.test(identifier) && !previous) throw new AppError('Recurso no encontrado.', 404);
      await assertWrite(req, resource, policy, previous);
    }
    next();
  } catch (error) { next(error); }
}
