import crypto from 'crypto';
import AppError from '../modules/errors/AppError.js';
import TarjetaAyudaRepository from '../repositories/TarjetaAyudaRepository.js';
import VinculoTutorPertenecienteRepository from '../repositories/VinculoTutorPertenecienteRepository.js';
import AuthorizationService from './AuthorizationService.js';
import NotificationProducerService from './NotificationProducerService.js';
import { cacheService } from './CacheService.js';
import { cleanHelpText } from './HelpAlertService.js';

export const DOMICILIO_MAX = 160;
export const MENSAJE_MAX = 200;
export const SCAN_NOTIFY_TTL_SECONDS = 600;

const TOKEN_FORMAT = /^[0-9a-f]{64}$/;
const BOOLEAN_FIELDS = ['activa', 'mostrarCelular', 'mostrarMail', 'mostrarDomicilio'];
const NOT_AVAILABLE = 'Tarjeta no disponible.';

const publicUrl = (token) => `/tarjeta/${token}`;
const digitsOnly = (value) => String(value ?? '').replace(/\D/g, '');
const firstName = (value) => String(value || '').trim().split(/\s+/)[0];

/** Texto opcional: sin caracteres de control ni espacios de mas; vacio = null; largo maximo estricto. */
function cleanOptionalText(value, max, label) {
  if (value == null) return null;
  if (typeof value !== 'string') throw new AppError(`${label} debe ser texto.`, 400);
  const cleaned = cleanHelpText(value, value.length);
  if (cleaned.length > max) throw new AppError(`${label} admite hasta ${max} caracteres.`, 400);
  return cleaned || null;
}

/**
 * Tarjeta de ayuda: el perteneciente muestra un QR; quien lo escanea (sin
 * cuenta) ve solo lo que el tutor decidio publicar. El token no da acceso a la
 * cuenta, por eso se guarda tal cual (el perteneciente tiene que poder volver
 * a mostrarlo).
 */
export default class TarjetaAyudaService {
  constructor() {
    this.TarjetaAyudaRepository = new TarjetaAyudaRepository();
    this.VinculoTutorPertenecienteRepository = new VinculoTutorPertenecienteRepository();
    this.NotificationProducerService = new NotificationProducerService();
    this.lastScanNotified = new Map();
  }

  async ensureSchemaAsync() {
    if (!this.schemaReady) {
      this.schemaReady = this.TarjetaAyudaRepository.ensureSchemaAsync().catch((error) => {
        this.schemaReady = null;
        throw error;
      });
    }
    await this.schemaReady;
  }

  async assertTutorAsync(idUsuario, idPerteneciente) {
    const userContext = await AuthorizationService.getUserContext(idUsuario);
    if (!userContext) throw new AppError('No autorizado', 403);
    const access = await AuthorizationService.canTutorActOnPerteneciente(userContext, { id_perteneciente: idPerteneciente });
    if (!access.allowed) throw new AppError('No autorizado para acceder a este recurso', 403);
  }

  async getOrCreateAsync(idPerteneciente, idUsuarioModificador) {
    await this.ensureSchemaAsync();
    const existing = await this.TarjetaAyudaRepository.getByPertenecienteIdAsync(idPerteneciente);
    if (existing) return existing;
    await this.TarjetaAyudaRepository.createIfMissingAsync(
      idPerteneciente,
      crypto.randomBytes(32).toString('hex'),
      idUsuarioModificador,
    );
    return await this.TarjetaAyudaRepository.getByPertenecienteIdAsync(idPerteneciente);
  }

  async buildTutorViewAsync(card, idPerteneciente) {
    const tutores = await this.VinculoTutorPertenecienteRepository.getActiveTutorContactsAsync(idPerteneciente);
    return {
      activa: card.activa,
      mostrarCelular: card.mostrar_celular,
      mostrarMail: card.mostrar_mail,
      mostrarDomicilio: card.mostrar_domicilio,
      domicilio: card.domicilio,
      mensaje: card.mensaje,
      url: publicUrl(card.token),
      fechaModificacion: card.fecha_modificacion,
      tutores: (tutores || []).map((t) => ({
        nombre: t.nombre,
        apellido: t.apellido,
        parentesco: t.parentesco ?? null,
        esTutorPrincipal: !!t.es_tutor_principal,
        tieneCelular: digitsOnly(t.telefono).length > 0,
        tieneMail: !!String(t.correo || '').trim(),
      })),
    };
  }

  getForTutorAsync = async (idUsuario, idPerteneciente) => {
    await this.assertTutorAsync(idUsuario, idPerteneciente);
    const card = await this.getOrCreateAsync(idPerteneciente, idUsuario);
    return await this.buildTutorViewAsync(card, idPerteneciente);
  };

  updateAsync = async (idUsuario, idPerteneciente, body = {}) => {
    await this.assertTutorAsync(idUsuario, idPerteneciente);
    for (const field of BOOLEAN_FIELDS) {
      if (typeof body[field] !== 'boolean') throw new AppError(`${field} debe ser verdadero o falso.`, 400);
    }
    const data = {
      activa: body.activa,
      mostrarCelular: body.mostrarCelular,
      mostrarMail: body.mostrarMail,
      mostrarDomicilio: body.mostrarDomicilio,
      domicilio: cleanOptionalText(body.domicilio, DOMICILIO_MAX, 'domicilio'),
      mensaje: cleanOptionalText(body.mensaje, MENSAJE_MAX, 'mensaje'),
    };

    await this.getOrCreateAsync(idPerteneciente, idUsuario);
    await this.TarjetaAyudaRepository.updateAsync(idPerteneciente, data, idUsuario);
    return await this.buildTutorViewAsync(await this.TarjetaAyudaRepository.getByPertenecienteIdAsync(idPerteneciente), idPerteneciente);
  };

  regenerateAsync = async (idUsuario, idPerteneciente) => {
    await this.assertTutorAsync(idUsuario, idPerteneciente);
    await this.getOrCreateAsync(idPerteneciente, idUsuario);
    await this.TarjetaAyudaRepository.updateTokenAsync(idPerteneciente, crypto.randomBytes(32).toString('hex'), idUsuario);
    return await this.buildTutorViewAsync(await this.TarjetaAyudaRepository.getByPertenecienteIdAsync(idPerteneciente), idPerteneciente);
  };

  getMineAsync = async (idUsuario) => {
    const userContext = await AuthorizationService.getUserContext(idUsuario);
    if (!userContext?.perteneciente?.id) throw new AppError('No autorizado', 403);
    const idPerteneciente = userContext.perteneciente.id;
    const card = await this.getOrCreateAsync(idPerteneciente, idUsuario);
    const persona = await this.TarjetaAyudaRepository.getPertenecienteNombreAsync(idPerteneciente);
    return { activa: card.activa, url: publicUrl(card.token), nombre: persona?.nombre, apellido: persona?.apellido };
  };

  getPublicAsync = async (token) => {
    if (typeof token !== 'string' || !TOKEN_FORMAT.test(token)) throw new AppError(NOT_AVAILABLE, 404);
    await this.ensureSchemaAsync();
    const card = await this.TarjetaAyudaRepository.getActiveByTokenAsync(token);
    if (!card) throw new AppError(NOT_AVAILABLE, 404);

    const tutores = await this.VinculoTutorPertenecienteRepository.getActiveTutorContactsAsync(card.id_perteneciente);

    // Fire-and-forget: un fallo del aviso nunca rompe la pagina.
    this.notifyScanAsync(card, tutores || []).catch(() => {});

    const response = { nombre: card.nombre, apellido: card.apellido };
    if (card.mensaje) response.mensaje = card.mensaje;
    if (card.mostrar_domicilio && card.domicilio) response.domicilio = card.domicilio;
    response.tutores = (tutores || []).map((t) => {
      const tutor = { nombre: t.nombre, apellido: t.apellido };
      if (t.parentesco) tutor.parentesco = t.parentesco;
      const celular = digitsOnly(t.telefono);
      if (card.mostrar_celular && celular) tutor.celular = celular;
      if (card.mostrar_mail && String(t.correo || '').trim()) tutor.mail = String(t.correo).trim();
      return tutor;
    });
    return response;
  };

  // Como mucho un aviso cada 10 minutos por perteneciente. El mapa local
  // cubre el caso sin Redis y las recargas simultaneas; la cache, varias instancias.
  async claimScanSlotAsync(idPerteneciente) {
    const now = Date.now();
    const last = this.lastScanNotified.get(idPerteneciente);
    if (last && now - last < SCAN_NOTIFY_TTL_SECONDS * 1000) return false;
    this.lastScanNotified.set(idPerteneciente, now);

    const cacheKey = `help_card_scan.${idPerteneciente}`;
    if (await cacheService.get(cacheKey)) return false;
    await cacheService.set(cacheKey, 1, SCAN_NOTIFY_TTL_SECONDS);
    return true;
  }

  async notifyScanAsync(card, tutores) {
    if (!tutores.length || !(await this.claimScanSlotAsync(card.id_perteneciente))) return;
    for (const tutor of tutores) {
      await this.NotificationProducerService.createAsync({
        recipientUserId: tutor.id_usuario,
        contextUserId: card.id_usuario,
        typeName: 'Alerta',
        title: `Abrieron la tarjeta de ayuda de ${firstName(card.nombre)}`,
        body: 'Alguien escaneó su código QR. Puede que te llamen.',
        referenceType: 'help_card_scan',
        referenceId: card.id_perteneciente,
      });
    }
  }
}
