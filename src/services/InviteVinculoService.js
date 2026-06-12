import crypto from 'crypto';
import InviteVinculoRepository from '../repositories/InviteVinculoRepository.js';
import VinculoTutorPertenecienteService from '../services/VinculoTutorPertenecienteService.js';
import AuthorizationRepository from '../repositories/AuthorizationRepository.js';
import AppError from '../modules/errors/AppError.js';

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 8;
const DEFAULT_HORAS_VALIDEZ = 1;

export default class InviteVinculoService {
  constructor() {
    this.inviteRepo = new InviteVinculoRepository();
    this.vinculoService = new VinculoTutorPertenecienteService();
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

  generateInviteAsync = async (idTutor, horasValidez = DEFAULT_HORAS_VALIDEZ) => {
    if (!idTutor) throw new AppError('id_tutor es requerido', 400);

    const codigo = this.generarCodigo();
    const token = this.generarToken();
    const fechaExpiracion = new Date(Date.now() + horasValidez * 60 * 60 * 1000);

    const invite = {
      codigo,
      token,
      id_tutor_creador: idTutor,
      estado: 'activo',
      fecha_expiracion: fechaExpiracion,
      fecha_creacion: new Date(),
    };

    const id = await this.inviteRepo.createAsync(invite);
    return { id, codigo, token, fecha_expiracion: fechaExpiracion };
  };

  joinViaCodigoAsync = async (idUsuario, codigo) => {
    if (!codigo) throw new AppError('codigo es requerido', 400);

    const invite = await this.inviteRepo.getByCodigoAsync(codigo);
    return await this._processJoin(idUsuario, invite);
  };

  joinViaTokenAsync = async (idUsuario, token) => {
    if (!token) throw new AppError('token es requerido', 400);

    const invite = await this.inviteRepo.getByTokenAsync(token);
    return await this._processJoin(idUsuario, invite);
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

    const perteneciente = await AuthorizationRepository.getPertenecienteByUsuarioId(idUsuario);
    if (!perteneciente) throw new AppError('Solo un usuario perteneciente puede aceptar una invitacion', 403);

    const vinculoExistente = await this.vinculoService.getByTutorYPertenecienteAsync(
      invite.id_tutor_creador,
      perteneciente.id,
    );

    if (vinculoExistente) throw new AppError('Ya existe un vinculo con este tutor', 409);

    const vinculacionesExistentes = await this.vinculoService.getByPertenecienteIdAsync(perteneciente.id);
    const esPrincipal = !vinculacionesExistentes || vinculacionesExistentes.length === 0;

    const newVinculoId = await this.vinculoService.createAsync({
      id_tutor: invite.id_tutor_creador,
      id_perteneciente: perteneciente.id,
      es_tutor_principal: esPrincipal,
      id_estado_vinculo: 2,
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
    };
  };

}
