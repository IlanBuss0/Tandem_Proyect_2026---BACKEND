import ActividadAsignadaRepository from '../repositories/ActividadAsignadaRepository.js';
import { cacheService } from './CacheService.js';
import PertenecienteRepository from '../repositories/PertenecienteRepository.js';
import NotificationProducerService from './NotificationProducerService.js';
import ActividadPersonalizadaRepository from '../repositories/ActividadPersonalizadaRepository.js';
import AppError from '../modules/errors/AppError.js';
import AuthorizationService from './AuthorizationService.js';
import { PERTENECIENTE_PERMISSIONS } from '../modules/security/permissions.constants.js';
import VinculoTutorPertenecienteRepository from '../repositories/VinculoTutorPertenecienteRepository.js';
import ActividadRepository from '../repositories/ActividadRepository.js';
import UsuarioRepository from '../repositories/UsuarioRepository.js';
import UsageEventService from './UsageEventService.js';
import { USAGE_EVENT_TYPES } from '../modules/usage/event-types.js';

const HELP_MOTIVOS = ['ayuda', 'no_entiende', 'pausa'];
const HELP_CACHE_TTL_SECONDS = 60;
const HELP_PASO_TEXTO_MAX = 200;

export default class ActividadAsignadaService {
  constructor() {
    console.log('Estoy en: ActividadAsignadaService.constructor()');
    this.ActividadAsignadaRepository = new ActividadAsignadaRepository();
    this.PertenecienteRepository = new PertenecienteRepository();
    this.NotificationProducerService = new NotificationProducerService();
    this.ActividadPersonalizadaRepository = new ActividadPersonalizadaRepository();
    this.VinculoTutorPertenecienteRepository = new VinculoTutorPertenecienteRepository();
    this.ActividadRepository = new ActividadRepository();
    this.UsuarioRepository = new UsuarioRepository();
    this.UsageEventService = new UsageEventService();
  }

  getAllAsync = async () => {
    console.log('ActividadAsignadaService.getAllAsync()');
    const returnArray = await this.ActividadAsignadaRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`ActividadAsignadaService.getByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id de la actividad asignada es invalido.');
    }
    const cacheKey = `actividad-asignada.${id}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;
    const returnEntity = await this.ActividadAsignadaRepository.getByIdAsync(id);
    if (returnEntity) await cacheService.set(cacheKey, returnEntity, 300);
    return returnEntity;
  };

  getByPertenecienteIdAsync = async (idPerteneciente) => {
    console.log(`ActividadAsignadaService.getByPertenecienteIdAsync(${idPerteneciente})`);
    if (!idPerteneciente || Number.isNaN(idPerteneciente)) {
      throw new Error('El id del perteneciente es invalido.');
    }
    const cacheKey = `actividad-asignada.perteneciente.${idPerteneciente}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;
    const result = await this.ActividadAsignadaRepository.getByPertenecienteIdAsync(idPerteneciente);
    if (result) await cacheService.set(cacheKey, result, 300);
    return result;
  };

  createAsync = async (entity) => {
    console.log(`ActividadAsignadaService.createAsync(${JSON.stringify(entity)})`);
    this.validarActividadAsignadaParaCrear(entity);
    if (entity.id_actividad_personalizada) {
      const [activity, perteneciente] = await Promise.all([
        this.ActividadPersonalizadaRepository.getByIdAsync(entity.id_actividad_personalizada),
        this.PertenecienteRepository.getByIdAsync(entity.id_perteneciente),
      ]);
      const gameLine = String(activity?.descripcion || '').split('\n').find((line) => line.trim().startsWith('Juego:'));
      if (gameLine) {
        try {
          const metadata = JSON.parse(gameLine.replace(/^Juego:\s*/i, ''));
          const sourceUserId = metadata?.gameData?.routineSequence?.sourceRoutine?.sourceUserId;
          if (sourceUserId && Number(sourceUserId) !== Number(perteneciente?.id_usuario)) {
            throw new AppError('La instantanea de rutina solo puede asignarse al perteneciente de origen.', 403);
          }
        } catch (error) {
          if (error instanceof AppError) throw error;
        }
      }
    }
    const newId = await this.ActividadAsignadaRepository.createAsync(entity);
    await cacheService.delByPattern(`actividad-asignada.perteneciente.${entity.id_perteneciente}`);
    const perteneciente = await this.PertenecienteRepository.getByIdAsync(entity.id_perteneciente);
    if (perteneciente) {
      await this.NotificationProducerService.createAsync({
        recipientUserId: perteneciente.id_usuario,
        actorUserId: entity.id_usuario_asignador,
        contextUserId: perteneciente.id_usuario,
        typeName: 'Información',
        title: 'Nueva actividad asignada',
        body: 'Tenés una nueva actividad disponible.',
        referenceType: 'activity',
        referenceId: newId,
      });
    }
    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`ActividadAsignadaService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id de la actividad asignada es obligatorio para actualizar.');
    }
    const previousEntity = await this.ActividadAsignadaRepository.getByIdAsync(entity.id);
    if (previousEntity == null) return 0;
    const rowsAffected = await this.ActividadAsignadaRepository.updateAsync(entity);
    await cacheService.delByPattern('actividad-asignada.*');
    if (rowsAffected > 0 && !previousEntity.fecha_completada && entity.fecha_completada) {
      const perteneciente = await this.PertenecienteRepository.getByIdAsync(previousEntity.id_perteneciente);
      if (perteneciente && previousEntity.id_usuario_asignador !== perteneciente.id_usuario) {
        await this.NotificationProducerService.createAsync({
          recipientUserId: previousEntity.id_usuario_asignador,
          actorUserId: perteneciente.id_usuario,
          contextUserId: perteneciente.id_usuario,
          typeName: 'Información',
          title: 'Actividad completada',
          body: 'Se completó una actividad asignada.',
          referenceType: 'activity',
          referenceId: entity.id,
        });
      }
    }
    return rowsAffected;
  };

  completeForUserAsync = async (id, idUsuario, score = null) => {
    const numericId = Number(id);
    if (!Number.isInteger(numericId) || numericId <= 0) {
      throw new AppError('El id de la actividad asignada es invalido.', 400);
    }
    if (score !== null && (!Number.isInteger(score) || score < 0 || score > 100)) {
      throw new AppError('El puntaje debe ser un entero entre 0 y 100.', 400);
    }

    const previousEntity = await this.ActividadAsignadaRepository.getByIdAsync(numericId);
    if (!previousEntity) throw new AppError('Actividad asignada no encontrada.', 404);

    const context = await AuthorizationService.getUserContext(idUsuario);
    if (Number(context?.perteneciente?.id) !== Number(previousEntity.id_perteneciente)) {
      throw new AppError('Solo el perteneciente asignado puede completar esta actividad.', 403);
    }
    await AuthorizationService.assertCanWritePertenecienteResource(idUsuario, previousEntity.id_perteneciente, {
      pertenecientePermissionName: PERTENECIENTE_PERMISSIONS.COMPLETAR_ACTIVIDADES,
      allowTutor: false,
    });

    const completed = await this.ActividadAsignadaRepository.completeAsync(numericId, score);
    await cacheService.delByPattern(`actividad-asignada.${numericId}`);
    await cacheService.delByPattern(`actividad-asignada.perteneciente.${previousEntity.id_perteneciente}`);

    if (!previousEntity.fecha_completada && previousEntity.id_usuario_asignador !== Number(idUsuario)) {
      await this.NotificationProducerService.createAsync({
        recipientUserId: previousEntity.id_usuario_asignador,
        actorUserId: Number(idUsuario),
        contextUserId: Number(idUsuario),
        typeName: 'Información',
        title: 'Actividad completada',
        body: 'Se completó una actividad asignada.',
        referenceType: 'activity',
        referenceId: numericId,
      });
    }

    return completed;
  };

  requestHelpAsync = async (id, idUsuario, { motivo, paso, totalPasos, pasoTexto } = {}) => {
    const numericId = Number(id);
    if (!Number.isInteger(numericId) || numericId <= 0) {
      throw new AppError('El id de la actividad asignada es invalido.', 400);
    }
    if (!HELP_MOTIVOS.includes(motivo)) {
      throw new AppError('El motivo es invalido.', 400);
    }
    const numericPaso = Number(paso);
    if (typeof paso === 'boolean' || paso === null || paso === '' || !Number.isInteger(numericPaso) || numericPaso < 1) {
      throw new AppError('El paso debe ser un entero mayor o igual a 1.', 400);
    }
    let numericTotal = null;
    if (totalPasos !== undefined && totalPasos !== null) {
      numericTotal = Number(totalPasos);
      if (typeof totalPasos === 'boolean' || totalPasos === '' || !Number.isInteger(numericTotal) || numericTotal < numericPaso) {
        throw new AppError('totalPasos debe ser un entero mayor o igual al paso.', 400);
      }
    }
    const cleanPasoTexto = typeof pasoTexto === 'string'
      // eslint-disable-next-line no-control-regex
      ? pasoTexto.replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, HELP_PASO_TEXTO_MAX).trim()
      : '';

    const asignada = await this.ActividadAsignadaRepository.getByIdAsync(numericId);
    if (!asignada) throw new AppError('Actividad asignada no encontrada.', 404);

    const context = await AuthorizationService.getUserContext(idUsuario);
    if (Number(context?.perteneciente?.id) !== Number(asignada.id_perteneciente)) {
      throw new AppError('Solo el perteneciente asignado puede pedir ayuda en esta actividad.', 403);
    }

    const cacheKey = `actividad-ayuda.${numericId}.${idUsuario}.${motivo}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) return { avisados: Array.isArray(cached) ? cached : [], repetido: true };

    const tutores = await this.VinculoTutorPertenecienteRepository.getActiveTutorUsersAsync(asignada.id_perteneciente);

    const [actividad, usuario] = await Promise.all([
      asignada.id_actividad_personalizada
        ? this.ActividadPersonalizadaRepository.getByIdAsync(asignada.id_actividad_personalizada)
        : this.ActividadRepository.getByIdAsync(asignada.id_actividad),
      this.UsuarioRepository.getByIdAsync(Number(idUsuario)),
    ]);
    const titulo = String(actividad?.titulo || 'la actividad').trim();
    const nombre = String(usuario?.nombre || '').trim().split(/\s+/)[0] || 'Tu familiar';

    const pasoLabel = numericTotal ? `paso ${numericPaso} de ${numericTotal}` : `paso ${numericPaso}`;
    const detalle = cleanPasoTexto ? `${pasoLabel}: ${cleanPasoTexto}` : `${pasoLabel}.`;
    const messages = {
      ayuda: { title: `${nombre} pidió ayuda`, body: `En «${titulo}», ${detalle}` },
      no_entiende: { title: `${nombre} no entiende un paso`, body: `En «${titulo}», ${detalle}` },
      pausa: { title: `${nombre} se está tomando una pausa`, body: `Estaba en «${titulo}», ${pasoLabel}. Quiso que lo sepas.` },
    };
    const { title, body } = messages[motivo];

    const avisados = [];
    for (const tutor of tutores || []) {
      const notificationId = await this.NotificationProducerService.createAsync({
        recipientUserId: tutor.id_usuario,
        actorUserId: Number(idUsuario),
        contextUserId: Number(idUsuario),
        typeName: 'Alerta',
        title,
        body,
        referenceType: `activity_help:${motivo}`,
        referenceId: numericId,
      });
      if (notificationId) avisados.push(String(tutor.nombre || '').trim().split(/\s+/)[0]);
    }

    // Fire-and-forget: logAsync nunca tira, y no se espera su resultado.
    this.UsageEventService.logAsync({
      idUsuario: Number(idUsuario),
      tipoEvento: USAGE_EVENT_TYPES.AYUDA_PEDIDA,
      entidadTipo: 'actividad_asignada',
      entidadId: String(numericId),
      valor: { motivo, paso: numericPaso, avisados: avisados.length },
      origen: 'perteneciente',
    }).catch(() => {});

    await cacheService.set(cacheKey, avisados, HELP_CACHE_TTL_SECONDS);
    return { avisados, repetido: false };
  };

  deleteByIdAsync = async (id) => {
    console.log(`ActividadAsignadaService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id de la actividad asignada es invalido.');
    }
    const rowsAffected = await this.ActividadAsignadaRepository.deleteByIdAsync(id);
    await cacheService.delByPattern('actividad-asignada.*');
    return rowsAffected;
  };

  validarActividadAsignadaParaCrear = (entity) => {
    if (!entity) {
      throw new Error('La actividad asignada es obligatoria.');
    }
    if (!entity.id_actividad && !entity.id_actividad_personalizada) {
      throw new Error('Se debe indicar id_actividad o id_actividad_personalizada.');
    }
    if (entity.id_actividad && entity.id_actividad_personalizada) {
      throw new Error('Solo se puede indicar id_actividad o id_actividad_personalizada, no ambos.');
    }
    if (!entity.id_perteneciente) {
      throw new Error('id_perteneciente es obligatorio.');
    }
    if (!entity.id_usuario_asignador) {
      throw new Error('id_usuario_asignador es obligatorio.');
    }
    if (!entity.id_estado_actividad) {
      throw new Error('id_estado_actividad es obligatorio.');
    }
    if (!entity.fecha_asignacion) {
      throw new Error('fecha_asignacion es obligatorio.');
    }
  };
}
