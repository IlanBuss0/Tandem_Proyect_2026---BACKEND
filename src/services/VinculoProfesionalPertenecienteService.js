import crypto from 'crypto';
import VinculoProfesionalPertenecienteRepository from '../repositories/VinculoProfesionalPertenecienteRepository.js';
import AuthorizationService from './AuthorizationService.js';
import AuthorizationRepository from '../repositories/AuthorizationRepository.js';
import AppError from '../modules/errors/AppError.js';
import { AUTH_ACTIONS } from '../modules/security/permissions.constants.js';

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 8;
const DEFAULT_HORAS_VALIDEZ = 1;
const MAX_GENERATION_ATTEMPTS = 5;

export default class VinculoProfesionalPertenecienteService {
  constructor() {
    console.log('Estoy en: VinculoProfesionalPertenecienteService.constructor()');
    this.VinculoProfesionalPertenecienteRepository = new VinculoProfesionalPertenecienteRepository();
  }

  getAllAsync = async () => {
    console.log('VinculoProfesionalPertenecienteService.getAllAsync()');
    const returnArray = await this.VinculoProfesionalPertenecienteRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`VinculoProfesionalPertenecienteService.getByIdAsync(${id})`);
    const returnEntity = await this.VinculoProfesionalPertenecienteRepository.getByIdAsync(id);
    return returnEntity;
  };

  createAsync = async (entity) => {
    console.log(`VinculoProfesionalPertenecienteService.createAsync(${JSON.stringify(entity)})`);
    const newId = await this.VinculoProfesionalPertenecienteRepository.createAsync(entity);
    return newId;
  };

  generarCodigo = () => {
    let codigo = '';
    for (let i = 0; i < CODE_LENGTH; i++) {
      codigo += CODE_CHARS[crypto.randomInt(CODE_CHARS.length)];
    }
    return codigo.slice(0, 4) + '-' + codigo.slice(4);
  };

  generarToken = () => crypto.randomBytes(32).toString('hex');

  normalizarCodigo = (codigo) => {
    return String(codigo || '')
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .replace(/^(.{4})(.{1,4})$/, '$1-$2');
  };

  generateProfessionalInviteByTutorAsync = async ({ idUsuarioTutor, idPerteneciente, horasValidez = DEFAULT_HORAS_VALIDEZ }) => {
    const numericIdPerteneciente = Number(idPerteneciente);
    if (!Number.isInteger(numericIdPerteneciente) || numericIdPerteneciente <= 0) {
      throw new AppError('id_perteneciente es obligatorio.', 400);
    }

    const userContext = await AuthorizationService.getUserContext(idUsuarioTutor);
    if (!userContext?.tutor?.id) {
      throw new AppError('Solo un tutor puede generar invitaciones para profesionales.', 403);
    }

    await AuthorizationService.assertCan(idUsuarioTutor, AUTH_ACTIONS.TUTOR_VINCULO_PROFESIONAL_APROBAR, {
      id_perteneciente: numericIdPerteneciente,
    });

    const horas = Number(horasValidez);
    const horasNormalizadas = Number.isFinite(horas) && horas > 0 ? Math.min(horas, 24) : DEFAULT_HORAS_VALIDEZ;

    for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt += 1) {
      const codigo = this.generarCodigo();
      const token = this.generarToken();
      const fechaExpiracion = new Date(Date.now() + horasNormalizadas * 60 * 60 * 1000);

      try {
        const id = await this.VinculoProfesionalPertenecienteRepository.createInviteAsync({
          codigo,
          token,
          id_tutor_creador: userContext.tutor.id,
          id_perteneciente: numericIdPerteneciente,
          estado: 'activo',
          fecha_expiracion: fechaExpiracion,
          fecha_creacion: new Date(),
        });

        return { id, codigo, token, id_perteneciente: numericIdPerteneciente, fecha_expiracion: fechaExpiracion };
      } catch (error) {
        if (error?.code !== '23505' || attempt === MAX_GENERATION_ATTEMPTS - 1) {
          throw error;
        }
      }
    }

    throw new AppError('No se pudo generar una invitacion unica para profesional.', 500);
  };

  joinProfessionalInviteAsync = async ({ idUsuarioProfesional, codigo, token }) => {
    if (!codigo && !token) {
      throw new AppError('Debe enviar codigo o token.', 400);
    }

    const invite = codigo
      ? await this.VinculoProfesionalPertenecienteRepository.getInviteByCodigoAsync(this.normalizarCodigo(codigo))
      : await this.VinculoProfesionalPertenecienteRepository.getInviteByTokenAsync(token);

    if (!invite) throw new AppError('Invitacion no encontrada.', 404);
    if (invite.estado !== 'activo') throw new AppError('Esta invitacion ya fue usada o esta expirada.', 400);

    const ahora = new Date();
    if (ahora > new Date(invite.fecha_expiracion)) {
      await this.VinculoProfesionalPertenecienteRepository.marcarInvitesExpiradosAsync();
      throw new AppError('La invitacion ha expirado.', 400);
    }

    const userContext = await AuthorizationService.getUserContext(idUsuarioProfesional);
    if (!userContext?.profesional?.id) {
      throw new AppError('Solo un profesional puede aceptar esta invitacion.', 403);
    }

    const profesional = await this.VinculoProfesionalPertenecienteRepository.getProfesionalActivoByIdAsync(userContext.profesional.id);
    if (!profesional) throw new AppError('Profesional no encontrado o inactivo.', 404);

    const estadoActivo = await this.VinculoProfesionalPertenecienteRepository.getEstadoVinculoActivoAsync();
    if (!estadoActivo?.id) {
      throw new AppError('No se encontro un estado de vinculo activo configurado.', 500);
    }

    const existing = await this.VinculoProfesionalPertenecienteRepository.getByProfesionalYPertenecienteAsync(
      userContext.profesional.id,
      invite.id_perteneciente,
    );

    const idVinculo = existing
      ? await this.VinculoProfesionalPertenecienteRepository.approveByTutorAsync({
          id: existing.id,
          idEstadoVinculo: estadoActivo.id,
          idTutorAprobador: invite.id_tutor_creador,
        })
      : await this.VinculoProfesionalPertenecienteRepository.createAsync({
          id_profesional: userContext.profesional.id,
          id_perteneciente: invite.id_perteneciente,
          id_estado_vinculo: estadoActivo.id,
          requiere_aprobacion_tutor: true,
          fue_aprobado_por_tutor: true,
          id_tutor_aprobador: invite.id_tutor_creador,
          fecha_solicitud: new Date(),
          fecha_resolucion: new Date(),
        });

    await this.VinculoProfesionalPertenecienteRepository.marcarInviteUsadoAsync(invite.id);

    const vinculo = await this.VinculoProfesionalPertenecienteRepository.getByIdAsync(idVinculo);
    const permisos_efectivos = await AuthorizationService.getEffectiveProfesionalPermissions(idVinculo);
    const tutor = await AuthorizationRepository.getTutorById(invite.id_tutor_creador);
    const idUsuarioPerteneciente = await AuthorizationRepository.getUsuarioIdByPertenecienteId(invite.id_perteneciente);

    return {
      vinculo,
      permisos_efectivos,
      profesional,
      id_usuario_tutor: tutor?.id_usuario ?? null,
      id_usuario_perteneciente: idUsuarioPerteneciente,
      was_existing: Boolean(existing),
    };
  };

  updateAsync = async (entity) => {
    console.log(`VinculoProfesionalPertenecienteService.updateAsync(${JSON.stringify(entity)})`);
    const rowsAffected = await this.VinculoProfesionalPertenecienteRepository.updateAsync(entity);
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`VinculoProfesionalPertenecienteService.deleteByIdAsync(${id})`);
    const rowsAffected = await this.VinculoProfesionalPertenecienteRepository.deleteByIdAsync(id);
    return rowsAffected;
  };

  deleteByTutorAsync = async ({ idUsuarioTutor, idVinculo }) => {
    const numericIdVinculo = Number(idVinculo);
    if (!Number.isInteger(numericIdVinculo) || numericIdVinculo <= 0) {
      throw new AppError('El id del vinculo profesional es invalido.', 400);
    }

    const vinculo = await AuthorizationRepository.getVinculoProfesionalById(numericIdVinculo);
    if (!vinculo) {
      throw new AppError('Vinculo profesional-perteneciente no encontrado.', 404);
    }

    await AuthorizationService.assertCan(idUsuarioTutor, AUTH_ACTIONS.TUTOR_VINCULO_PROFESIONAL_APROBAR, {
      id_perteneciente: vinculo.id_perteneciente,
    });

    const rowsAffected = await this.VinculoProfesionalPertenecienteRepository.deleteByIdAsync(numericIdVinculo);
    return {
      rowsAffected,
      vinculo,
      id_usuario_perteneciente: await AuthorizationRepository.getUsuarioIdByPertenecienteId(vinculo.id_perteneciente),
    };
  };
}
