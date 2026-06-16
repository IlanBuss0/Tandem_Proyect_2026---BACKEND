import crypto from 'crypto';
import InviteVinculoRepository from '../repositories/InviteVinculoRepository.js';
import VinculoTutorPertenecienteService from '../services/VinculoTutorPertenecienteService.js';
import PertenecienteService from '../services/PertenecienteService.js';
import AuthorizationRepository from '../repositories/AuthorizationRepository.js';
import AppError from '../modules/errors/AppError.js';

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 8;
const DEFAULT_HORAS_VALIDEZ = 1;
const MAX_GENERATION_ATTEMPTS = 5;

export default class InviteVinculoService {
  constructor() {
    this.inviteRepo = new InviteVinculoRepository();
    this.vinculoService = new VinculoTutorPertenecienteService();
    this.pertenecienteService = new PertenecienteService();
  }

  generarCodigo = () => {
    let codigo = '';
    for (let i = 0; i < CODE_LENGTH; i++) {
      codigo += CODE_CHARS[crypto.randomInt(CODE_CHARS.length)];
    }
    return codigo.slice(0, 4) + '-' + codigo.slice(4);
  };

  generarToken = () => {
    return crypto.randomBytes(32).toString('hex');
  };

  normalizarCodigo = (codigo) => {
    return String(codigo || '')
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .replace(/^(.{4})(.{1,4})$/, '$1-$2');
  };

  generateInviteAsync = async (idTutor, horasValidez = DEFAULT_HORAS_VALIDEZ) => {
    if (!idTutor) throw new AppError('id_tutor es requerido', 400);

    const horas = Number(horasValidez);
    const horasNormalizadas = Number.isFinite(horas) && horas > 0 ? Math.min(horas, 24) : DEFAULT_HORAS_VALIDEZ;

    for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt += 1) {
      const codigo = this.generarCodigo();
      const token = this.generarToken();
      const fechaExpiracion = new Date(Date.now() + horasNormalizadas * 60 * 60 * 1000);

      const invite = {
        codigo,
        token,
        id_tutor_creador: idTutor,
        estado: 'activo',
        fecha_expiracion: fechaExpiracion,
        fecha_creacion: new Date(),
      };

      try {
        const id = await this.inviteRepo.createAsync(invite);
        return { id, codigo, token, fecha_expiracion: fechaExpiracion };
      } catch (error) {
        if (error?.code !== '23505' || attempt === MAX_GENERATION_ATTEMPTS - 1) {
          throw error;
        }
      }
    }

    throw new AppError('No se pudo generar una invitacion unica', 500);
  };

  joinViaCodigoAsync = async (idUsuario, codigo) => {
    if (!codigo) throw new AppError('codigo es requerido', 400);

    const invite = await this.inviteRepo.getByCodigoAsync(this.normalizarCodigo(codigo));
    return await this._processJoin(idUsuario, invite);
  };

  joinViaTokenAsync = async (idUsuario, token) => {
    if (!token) throw new AppError('token es requerido', 400);

    const invite = await this.inviteRepo.getByTokenAsync(token);
    return await this._processJoin(idUsuario, invite);
  };

  _getOrCreatePertenecienteForInvite = async (idUsuario) => {
    const existente = await AuthorizationRepository.getPertenecienteByUsuarioId(idUsuario);
    if (existente) return existente;

    const usuario = await AuthorizationRepository.getUsuarioById(idUsuario);
    if (!usuario?.activo) throw new AppError('Usuario no encontrado o inactivo', 403);
    if (Number(usuario.id_tipo_usuario) !== 1) {
      throw new AppError('Solo un usuario perteneciente puede aceptar una invitacion', 403);
    }

    const [nivelApoyo, autonomiaOperativa] = await Promise.all([
      this.inviteRepo.getDefaultNivelApoyoAsync(),
      this.inviteRepo.getDefaultAutonomiaOperativaAsync(),
    ]);

    if (!nivelApoyo?.id || !autonomiaOperativa?.id) {
      throw new AppError('Faltan catalogos de nivel de apoyo o autonomia para crear el perfil perteneciente', 500);
    }

    const id = await this.pertenecienteService.createAsync({
      id_usuario: idUsuario,
      id_nivel_apoyo: nivelApoyo.id,
      id_autonomia_operativa: autonomiaOperativa.id,
      puede_autogestionarse: false,
      observacion_general: 'Perfil creado automaticamente al aceptar una invitacion de tutor.',
    });

    return await AuthorizationRepository.getPertenecienteByUsuarioId(idUsuario)
      || {
        id,
        id_usuario: idUsuario,
        puede_autogestionarse: false,
      };
  };

  _processJoin = async (idUsuario, invite) => {
    if (!invite) throw new AppError('Invitacion no encontrada', 404);
    if (invite.estado !== 'activo') throw new AppError('Esta invitacion ya fue usada o esta expirada', 400);

    const ahora = new Date();
    const expiracion = new Date(invite.fecha_expiracion);
    if (ahora > expiracion) {
      await this.inviteRepo.marcarExpiradosAsync();
      throw new AppError('La invitacion ha expirado', 400);
    }

    const perteneciente = await this._getOrCreatePertenecienteForInvite(idUsuario);

    const vinculoExistente = await this.vinculoService.getByTutorYPertenecienteAsync(
      invite.id_tutor_creador,
      perteneciente.id,
    );

    if (vinculoExistente) throw new AppError('Ya existe un vinculo con este tutor', 409);

    const vinculacionesExistentes = await this.vinculoService.getByPertenecienteIdAsync(perteneciente.id);
    const esPrincipal = !vinculacionesExistentes || vinculacionesExistentes.length === 0;

    const estadoActivo = await this.inviteRepo.getEstadoVinculoActivoAsync();
    if (!estadoActivo?.id) {
      throw new AppError('No se encontro un estado de vinculo activo configurado', 500);
    }

    const newVinculoId = await this.vinculoService.createAsync({
      id_tutor: invite.id_tutor_creador,
      id_perteneciente: perteneciente.id,
      es_tutor_principal: esPrincipal,
      id_estado_vinculo: estadoActivo.id,
      fecha_alta: new Date(),
      id_usuario_creador: invite.id_tutor_creador,
    });

    await this.inviteRepo.marcarUsadoAsync(invite.id);

    const vinculoCreado = await this.vinculoService.getByIdAsync(newVinculoId);

    return {
      vinculo: vinculoCreado,
      es_principal: esPrincipal,
    };
  };

  getByTutorAsync = async (idTutor) => {
    return await this.inviteRepo.getByTutorCreadorAsync(idTutor);
  };

  resolveTokenAsync = async (token) => {
    const invite = await this.inviteRepo.getByTokenAsync(token);
    if (!invite) throw new AppError('Invitacion no encontrada', 404);

    return {
      codigo: invite.codigo,
      id_tutor_creador: invite.id_tutor_creador,
      estado: invite.estado,
      fecha_expiracion: invite.fecha_expiracion,
    };
  };

}
