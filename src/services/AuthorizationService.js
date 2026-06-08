import AppError from '../modules/errors/AppError.js';
import AuthorizationRepository from '../repositories/AuthorizationRepository.js';
import {
  AUTH_ACTIONS,
  PERTENECIENTE_DEFAULTS,
  PERTENECIENTE_PERMISSIONS,
  PROFESIONAL_DEFAULTS,
  PROFESIONAL_PERMISSIONS,
} from '../modules/security/permissions.constants.js';

class AuthorizationService {
  async getUserContext(idUsuario) {
    const usuario = await AuthorizationRepository.getUsuarioById(idUsuario);
    if (!usuario?.activo) return null;

    const [perteneciente, tutor, profesional] = await Promise.all([
      AuthorizationRepository.getPertenecienteByUsuarioId(idUsuario),
      AuthorizationRepository.getTutorByUsuarioId(idUsuario),
      AuthorizationRepository.getProfesionalByUsuarioId(idUsuario),
    ]);

    return { usuario, perteneciente, tutor, profesional };
  }

  async getEffectivePertenecientePermissions(idPerteneciente) {
    const perteneciente = await AuthorizationRepository.getPertenecienteById(idPerteneciente);
    if (!perteneciente?.usuario_activo) throw new AppError('Perteneciente no encontrado o inactivo', 404);

    const mode = perteneciente.puede_autogestionarse ? 'AUTOGESTIONADO' : 'TUTELADO';
    const defaults = PERTENECIENTE_DEFAULTS[mode];
    const permisos = {};

    for (const [nombre, defaultValue] of Object.entries(defaults)) {
      const row = await AuthorizationRepository.getPertenecientePermission(idPerteneciente, nombre);
      permisos[nombre] = {
        habilitado: row?.habilitado ?? defaultValue,
        source: row ? 'otorgado' : 'default',
      };
    }

    return {
      id_perteneciente: idPerteneciente,
      puede_autogestionarse: perteneciente.puede_autogestionarse,
      mode,
      permisos,
    };
  }

  async getEffectiveProfesionalPermissions(idVinculoProfesionalPerteneciente) {
    const vinculo = await AuthorizationRepository.getVinculoProfesionalById(idVinculoProfesionalPerteneciente);
    if (!vinculo) throw new AppError('Vinculo profesional-perteneciente no encontrado', 404);

    const permisos = {};
    for (const [nombre, defaultValue] of Object.entries(PROFESIONAL_DEFAULTS)) {
      const row = await AuthorizationRepository.getProfesionalPermission(idVinculoProfesionalPerteneciente, nombre);
      const resolvedDefault = await this.resolveProfesionalDefault(nombre, vinculo, defaultValue);
      permisos[nombre] = {
        habilitado: row?.habilitado ?? resolvedDefault,
        source: row ? 'otorgado' : 'default',
      };
    }

    return {
      id_vinculo_profesional_perteneciente: idVinculoProfesionalPerteneciente,
      vinculo_aprobado: this.isProfessionalLinkApproved(vinculo),
      permisos,
    };
  }

  async can(idUsuario, action, context = {}) {
    const userContext = await this.getUserContext(idUsuario);
    if (!userContext) return this.deny('Usuario no encontrado o inactivo');

    switch (action) {
      case AUTH_ACTIONS.PERTENECIENTE_ACTIVIDAD_COMPLETAR:
        return await this.canPertenecientePermission(userContext, context, PERTENECIENTE_PERMISSIONS.COMPLETAR_ACTIVIDADES);
      case AUTH_ACTIONS.PERTENECIENTE_CHAT_ENVIAR:
        return await this.canPertenecientePermission(userContext, context, PERTENECIENTE_PERMISSIONS.ENVIAR_MENSAJES);
      case AUTH_ACTIONS.PERTENECIENTE_CHAT_PROFESIONAL_ENVIAR:
        return await this.canPertenecienteChatProfesional(userContext, context);
      case AUTH_ACTIONS.PERTENECIENTE_UBICACION_COMPARTIR:
        return await this.canPertenecientePermission(userContext, context, PERTENECIENTE_PERMISSIONS.COMPARTIR_UBICACION);
      case AUTH_ACTIONS.PERTENECIENTE_PUNTOS_GASTAR:
        return await this.canPertenecientePermission(userContext, context, PERTENECIENTE_PERMISSIONS.GASTAR_PUNTOS);
      case AUTH_ACTIONS.PERTENECIENTE_ACTIVIDAD_CREAR_PROPIA:
        return await this.canPertenecientePermission(userContext, context, PERTENECIENTE_PERMISSIONS.CREAR_ACTIVIDADES_PROPIAS);
      case AUTH_ACTIONS.PERTENECIENTE_PERFIL_EDITAR:
        return await this.canPertenecientePermission(userContext, context, PERTENECIENTE_PERMISSIONS.EDITAR_PERFIL);
      case AUTH_ACTIONS.PERTENECIENTE_PERFIL_SENSIBLE_EDITAR:
        return await this.canPertenecientePermission(userContext, context, PERTENECIENTE_PERMISSIONS.EDITAR_PERFIL_SENSIBLE);
      case AUTH_ACTIONS.TUTOR_PERMISOS_MODIFICAR:
      case AUTH_ACTIONS.TUTOR_VINCULO_PROFESIONAL_APROBAR:
        return await this.canTutorActOnPerteneciente(userContext, context);
      case AUTH_ACTIONS.PROFESIONAL_HISTORIAL_VER:
        return await this.canProfesionalPermission(userContext, context, PROFESIONAL_PERMISSIONS.VER_HISTORIAL);
      case AUTH_ACTIONS.PROFESIONAL_UBICACION_VER:
        return await this.canProfesionalPermission(userContext, context, PROFESIONAL_PERMISSIONS.VER_UBICACION);
      case AUTH_ACTIONS.PROFESIONAL_ACTIVIDAD_ASIGNAR:
        return await this.canProfesionalPermission(userContext, context, PROFESIONAL_PERMISSIONS.ASIGNAR_ACTIVIDADES);
      case AUTH_ACTIONS.PROFESIONAL_ACTIVIDAD_PERSONALIZADA_CREAR:
        return await this.canProfesionalPermission(userContext, context, PROFESIONAL_PERMISSIONS.CREAR_ACTIVIDADES_PERSONALIZADAS);
      case AUTH_ACTIONS.PROFESIONAL_SESION_AGENDAR:
        return await this.canProfesionalPermission(userContext, context, PROFESIONAL_PERMISSIONS.AGENDAR_SESIONES);
      case AUTH_ACTIONS.PROFESIONAL_CHAT_ENVIAR:
        return await this.canProfesionalPermission(userContext, context, PROFESIONAL_PERMISSIONS.ENVIAR_MENSAJES);
      default:
        return this.deny('Accion de autorizacion desconocida');
    }
  }

  async assertCan(idUsuario, action, context = {}) {
    const result = await this.can(idUsuario, action, context);
    if (!result.allowed) throw new AppError(result.reason || 'No autorizado', 403);
    return result;
  }

  async assertCanReadPertenecientePermissions(idUsuario, idPerteneciente) {
    const userContext = await this.getUserContext(idUsuario);
    if (!userContext) throw new AppError('No autorizado', 403);

    if (userContext.perteneciente?.id === idPerteneciente) return this.allow();

    if (userContext.tutor?.id) {
      const tutorAccess = await this.canTutorActOnPerteneciente(userContext, { id_perteneciente: idPerteneciente });
      if (tutorAccess.allowed) return tutorAccess;
    }

    throw new AppError('No autorizado para consultar permisos de este perteneciente', 403);
  }

  async assertCanReadProfesionalPermissions(idUsuario, idVinculoProfesionalPerteneciente) {
    const userContext = await this.getUserContext(idUsuario);
    if (!userContext) throw new AppError('No autorizado', 403);

    const vinculo = await AuthorizationRepository.getVinculoProfesionalById(idVinculoProfesionalPerteneciente);
    if (!vinculo) throw new AppError('Vinculo profesional-perteneciente no encontrado', 404);

    if (userContext.profesional?.id === vinculo.id_profesional) return this.allow();

    if (userContext.tutor?.id) {
      const tutorAccess = await this.canTutorActOnPerteneciente(userContext, { id_perteneciente: vinculo.id_perteneciente });
      if (tutorAccess.allowed) return tutorAccess;
    }

    throw new AppError('No autorizado para consultar permisos de este vinculo profesional', 403);
  }

  async assertCanModifyProfesionalPermissions(idUsuario, idVinculoProfesionalPerteneciente) {
    const userContext = await this.getUserContext(idUsuario);
    if (!userContext?.tutor?.id) throw new AppError('Solo un tutor activo puede modificar permisos profesionales', 403);

    const vinculo = await AuthorizationRepository.getVinculoProfesionalById(idVinculoProfesionalPerteneciente);
    if (!vinculo) throw new AppError('Vinculo profesional-perteneciente no encontrado', 404);

    const tutorAccess = await this.canTutorActOnPerteneciente(userContext, {
      id_perteneciente: vinculo.id_perteneciente,
    });

    if (!tutorAccess.allowed) throw new AppError(tutorAccess.reason || 'No autorizado', 403);
    return tutorAccess;
  }

  async canPertenecientePermission(userContext, context, permissionName) {
    const idPerteneciente = Number(context.id_perteneciente ?? userContext.perteneciente?.id);
    if (!idPerteneciente) return this.deny('id_perteneciente requerido');
    if (userContext.perteneciente?.id !== idPerteneciente) return this.deny('El usuario no es el perteneciente indicado');

    const effective = await this.getEffectivePertenecientePermissions(idPerteneciente);
    if (effective.permisos[permissionName]?.habilitado === true) return this.allow();
    return this.deny(`Permiso ${permissionName} deshabilitado`);
  }

  async canTutorActOnPerteneciente(userContext, context) {
    const idPerteneciente = Number(context.id_perteneciente);
    if (!idPerteneciente) return this.deny('id_perteneciente requerido');
    if (!userContext.tutor?.id) return this.deny('El usuario no es tutor');

    const ok = await AuthorizationRepository.isTutorActivoForPerteneciente(userContext.tutor.id, idPerteneciente);
    return ok ? this.allow() : this.deny('No existe vinculo tutor activo con el perteneciente');
  }

  async canProfesionalPermission(userContext, context, permissionName) {
    const idPerteneciente = Number(context.id_perteneciente);
    if (!idPerteneciente) return this.deny('id_perteneciente requerido');
    if (!userContext.profesional?.id) return this.deny('El usuario no es profesional');

    const vinculo = await AuthorizationRepository.getApprovedProfessionalLink(userContext.profesional.id, idPerteneciente);
    if (!this.isProfessionalLinkApproved(vinculo)) return this.deny('No existe vinculo profesional aprobado');

    const row = await AuthorizationRepository.getProfesionalPermission(vinculo.id, permissionName);
    const defaultValue = await this.resolveProfesionalDefault(permissionName, vinculo, PROFESIONAL_DEFAULTS[permissionName] ?? false);
    const habilitado = row?.habilitado ?? defaultValue;

    return habilitado ? this.allow({ id_vinculo_profesional_perteneciente: vinculo.id }) : this.deny(`Permiso ${permissionName} deshabilitado`);
  }

  async canPertenecienteChatProfesional(userContext, context) {
    const base = await this.canPertenecientePermission(userContext, context, PERTENECIENTE_PERMISSIONS.CHATEAR_CON_PROFESIONAL);
    if (!base.allowed) return base;

    const idProfesional = Number(context.id_profesional);
    const idPerteneciente = Number(context.id_perteneciente ?? userContext.perteneciente?.id);

    if (!idProfesional) return this.deny('id_profesional requerido');

    const vinculo = await AuthorizationRepository.getApprovedProfessionalLink(idProfesional, idPerteneciente);
    if (!this.isProfessionalLinkApproved(vinculo)) return this.deny('No existe vinculo profesional aprobado');

    return this.allow({ id_vinculo_profesional_perteneciente: vinculo.id });
  }

  async getProfessionalPertenecienteChatContext(idChat, idUsuarioEmisor) {
    return await AuthorizationRepository.getProfessionalPertenecienteChatContext(idChat, idUsuarioEmisor);
  }

  async assertCanSendMessageToChat(idUsuarioEmisor, idChat) {
    const chatContext = await this.getProfessionalPertenecienteChatContext(idChat, idUsuarioEmisor);
    if (!chatContext) return this.allow();

    if (chatContext.emisor_tipo === 'profesional') {
      return await this.assertCan(idUsuarioEmisor, AUTH_ACTIONS.PROFESIONAL_CHAT_ENVIAR, {
        id_perteneciente: chatContext.id_perteneciente,
      });
    }

    if (chatContext.emisor_tipo === 'perteneciente') {
      return await this.assertCan(idUsuarioEmisor, AUTH_ACTIONS.PERTENECIENTE_CHAT_PROFESIONAL_ENVIAR, {
        id_perteneciente: chatContext.id_perteneciente,
        id_profesional: chatContext.id_profesional,
      });
    }

    throw new AppError('No autorizado para enviar mensajes en este chat', 403);
  }

  async resolveProfesionalDefault(permissionName, vinculo, fallback) {
    if (permissionName !== PROFESIONAL_PERMISSIONS.ENVIAR_MENSAJES) return fallback;

    const perteneciente = await AuthorizationRepository.getPertenecienteById(vinculo.id_perteneciente);
    if (perteneciente?.puede_autogestionarse === true) return true;

    return fallback;
  }

  isProfessionalLinkApproved(vinculo) {
    if (!vinculo) return false;

    const estadoVinculo = String(vinculo.estado_vinculo ?? '').toLowerCase();
    const estadoValidacion = String(vinculo.estado_validacion_profesional ?? '').toLowerCase();
    const vinculoActivo = ['activo', 'activa', 'aprobado', 'aprobada', 'aceptado', 'aceptada'].includes(estadoVinculo);
    const profesionalValidado = ['validado', 'validada', 'aprobado', 'aprobada'].includes(estadoValidacion);
    const aprobadoPorTutor = !vinculo.requiere_aprobacion_tutor || (vinculo.fue_aprobado_por_tutor && vinculo.id_tutor_aprobador);

    return Boolean(
      vinculoActivo
        && profesionalValidado
        && vinculo.usuario_profesional_activo
        && vinculo.usuario_perteneciente_activo
        && aprobadoPorTutor,
    );
  }

  allow(extra = {}) {
    return { allowed: true, ...extra };
  }

  deny(reason) {
    return { allowed: false, reason };
  }
}

export default new AuthorizationService();
