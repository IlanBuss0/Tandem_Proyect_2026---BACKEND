import ReporteProfesionalRepository from '../repositories/ReporteProfesionalRepository.js';
import ProfesionalRepository from '../repositories/ProfesionalRepository.js';
import VinculoProfesionalPertenecienteRepository from '../repositories/VinculoProfesionalPertenecienteRepository.js';
import VinculoTutorPertenecienteRepository from '../repositories/VinculoTutorPertenecienteRepository.js';
import PertenecienteRepository from '../repositories/PertenecienteRepository.js';
import NivelApoyoRepository from '../repositories/NivelApoyoRepository.js';
import TutorRepository from '../repositories/TutorRepository.js';
import UsuarioRepository from '../repositories/UsuarioRepository.js';
import TipoMensajeRepository from '../repositories/TipoMensajeRepository.js';
import SesionProfesionalRepository from '../repositories/SesionProfesionalRepository.js';
import AiReportService from './AiReportService.js';
import ChatService from './ChatService.js';
import MensajeService from './MensajeService.js';
import NotificationProducerService from './NotificationProducerService.js';
import { DEFAULT_INCLUIR_HISTORIAL, DEFAULT_INCLUIR_MENSUAL } from './ReportePdfOptions.js';

const MAX_TITULO = 200;
const MAX_CONTENIDO = 20000;

function badRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

const ACTIVE_VINCULO_ESTADOS = ['activo', 'activa', 'aprobado', 'aprobada', 'aceptado', 'aceptada'];

export default class ReporteProfesionalService {
  constructor() {
    console.log('Estoy en: ReporteProfesionalService.constructor()');
    this.ReporteProfesionalRepository = new ReporteProfesionalRepository();
    this.ProfesionalRepository = new ProfesionalRepository();
    this.VinculoProfesionalPertenecienteRepository = new VinculoProfesionalPertenecienteRepository();
    this.VinculoTutorPertenecienteRepository = new VinculoTutorPertenecienteRepository();
    this.PertenecienteRepository = new PertenecienteRepository();
    this.NivelApoyoRepository = new NivelApoyoRepository();
    this.TutorRepository = new TutorRepository();
    this.UsuarioRepository = new UsuarioRepository();
    this.TipoMensajeRepository = new TipoMensajeRepository();
    this.SesionProfesionalRepository = new SesionProfesionalRepository();
    this.AiReportService = new AiReportService();
    this.ChatService = new ChatService();
    this.MensajeService = new MensajeService();
    this.NotificationProducerService = new NotificationProducerService();
  }

  /** Tira 403 si el profesional no tiene un vinculo activo/aprobado con ese perteneciente. */
  assertVinculoActivoAsync = async (idProfesional, idPerteneciente) => {
    const vinculo = await this.VinculoProfesionalPertenecienteRepository.getByProfesionalYPertenecienteAsync(idProfesional, idPerteneciente);
    const estado = String(vinculo?.estado_vinculo ?? '').toLowerCase();
    if (!vinculo || !ACTIVE_VINCULO_ESTADOS.includes(estado)) {
      const error = new Error('No tenes un vinculo activo con este perteneciente.');
      error.statusCode = 403;
      throw error;
    }
  };

  buildPacienteContextAsync = async (idPerteneciente) => {
    const perteneciente = await this.PertenecienteRepository.getByIdAsync(idPerteneciente);
    if (!perteneciente) {
      const error = new Error('Perteneciente no encontrado.');
      error.statusCode = 404;
      throw error;
    }
    const [usuario, nivelApoyo] = await Promise.all([
      this.UsuarioRepository.getByIdAsync(perteneciente.id_usuario),
      perteneciente.id_nivel_apoyo ? this.NivelApoyoRepository.getByIdAsync(perteneciente.id_nivel_apoyo) : null,
    ]);
    return { perteneciente, pacienteNombre: usuario?.nombre || usuario?.nombre_usuario || 'Paciente', nivelApoyoNombre: nivelApoyo?.nombre || null };
  };

  generateOnDemandAsync = async (idUsuarioProfesional, idProfesional, { id_perteneciente, sesiones }) => {
    console.log(`ReporteProfesionalService.generateOnDemandAsync(profesional=${idProfesional}, perteneciente=${id_perteneciente}, sesiones=${sesiones?.length ?? 0})`);
    const idPerteneciente = Number(id_perteneciente);
    if (!idPerteneciente || Number.isNaN(idPerteneciente)) throw new Error('id_perteneciente es obligatorio.');
    if (!Array.isArray(sesiones) || sesiones.length === 0) throw new Error('Selecciona al menos una sesion.');

    await this.assertVinculoActivoAsync(idProfesional, idPerteneciente);
    const { pacienteNombre, nivelApoyoNombre } = await this.buildPacienteContextAsync(idPerteneciente);

    const notasTexto = sesiones
      .filter((s) => s?.notas_texto && String(s.notas_texto).trim())
      .map((s) => ({ fecha_sesion: s.fecha_sesion, titulo: s.titulo, texto: String(s.notas_texto).trim().slice(0, 8000) }));

    const { titulo, contenido } = await this.AiReportService.generatePatientSummaryAsync({
      pacienteNombre,
      nivelApoyoNombre,
      sesiones: sesiones.map((s) => ({ fecha_sesion: s.fecha_sesion, titulo: s.titulo, estado: s.estado || 'completada' })),
      notasTexto: notasTexto.length > 0 ? notasTexto : null,
    });

    return await this.ReporteProfesionalRepository.createAsync({
      id_profesional: idProfesional,
      id_perteneciente: idPerteneciente,
      titulo,
      contenido,
      id_tipo: 'manual',
    });
  };

  /** Reporte "liviano" para tareas programadas: nunca incluye texto de notas. */
  generateScheduledAsync = async (idProfesional, idPerteneciente) => {
    console.log(`ReporteProfesionalService.generateScheduledAsync(profesional=${idProfesional}, perteneciente=${idPerteneciente})`);
    const { pacienteNombre, nivelApoyoNombre } = await this.buildPacienteContextAsync(idPerteneciente);
    const sesiones = await this.SesionProfesionalRepository.getByProfesionalIdAsync(idProfesional);
    const sesionesPaciente = sesiones.filter((s) => Number(s.id_perteneciente) === Number(idPerteneciente));

    const { titulo, contenido } = await this.AiReportService.generatePatientSummaryAsync({
      pacienteNombre,
      nivelApoyoNombre,
      sesiones: sesionesPaciente.map((s) => ({ fecha_sesion: s.fecha_sesion, titulo: s.titulo, estado: s.estado })),
      notasTexto: null,
    });

    return await this.ReporteProfesionalRepository.createAsync({
      id_profesional: idProfesional,
      id_perteneciente: idPerteneciente,
      titulo,
      contenido,
      id_tipo: 'programado',
    });
  };

  /** Nunca persiste (this.ReporteProfesionalRepository.createAsync deliberadamente no se llama aca). */
  generateSessionPrepAsync = async (idProfesional, { id_perteneciente, sesion_objetivo, sesiones_pasadas }) => {
    console.log(`ReporteProfesionalService.generateSessionPrepAsync(profesional=${idProfesional}, perteneciente=${id_perteneciente}, pasadas=${sesiones_pasadas?.length ?? 0})`);
    const idPerteneciente = Number(id_perteneciente);
    if (!idPerteneciente || Number.isNaN(idPerteneciente)) throw new Error('id_perteneciente es obligatorio.');
    if (!sesion_objetivo?.titulo || !sesion_objetivo?.fecha_sesion) throw new Error('sesion_objetivo es obligatoria.');
    if (!Array.isArray(sesiones_pasadas) || sesiones_pasadas.length === 0) {
      throw new Error('No hay sesiones pasadas con notas para preparar esta sesion.');
    }

    await this.assertVinculoActivoAsync(idProfesional, idPerteneciente);
    const { pacienteNombre, nivelApoyoNombre } = await this.buildPacienteContextAsync(idPerteneciente);

    const notasTexto = sesiones_pasadas
      .filter((s) => s?.notas_texto && String(s.notas_texto).trim())
      .map((s) => ({ fecha_sesion: s.fecha_sesion, titulo: s.titulo, texto: String(s.notas_texto).trim().slice(0, 8000) }));

    if (notasTexto.length === 0) {
      throw new Error('Ninguna de las sesiones pasadas seleccionadas tiene contenido de nota disponible.');
    }

    return await this.AiReportService.generateSessionPrepAsync({
      pacienteNombre,
      nivelApoyoNombre,
      sesionObjetivo: { titulo: sesion_objetivo.titulo, fecha_sesion: sesion_objetivo.fecha_sesion },
      sesionesPasadas: sesiones_pasadas.map((s) => ({ fecha_sesion: s.fecha_sesion, titulo: s.titulo, estado: s.estado || 'completada' })),
      notasTexto,
    });
  };

  /** Nunca persiste — pregunta puntual, no queda historial. */
  answerPatientQuestionAsync = async (idProfesional, { id_perteneciente, pregunta, sesiones }) => {
    console.log(`ReporteProfesionalService.answerPatientQuestionAsync(profesional=${idProfesional}, perteneciente=${id_perteneciente})`);
    const idPerteneciente = Number(id_perteneciente);
    if (!idPerteneciente || Number.isNaN(idPerteneciente)) throw new Error('id_perteneciente es obligatorio.');
    if (!pregunta || !String(pregunta).trim()) throw new Error('La pregunta es obligatoria.');
    if (!Array.isArray(sesiones) || sesiones.length === 0) {
      throw new Error('No hay sesiones con notas disponibles para responder sobre este paciente.');
    }

    await this.assertVinculoActivoAsync(idProfesional, idPerteneciente);
    const { pacienteNombre, nivelApoyoNombre } = await this.buildPacienteContextAsync(idPerteneciente);

    const notasTexto = sesiones
      .filter((s) => s?.notas_texto && String(s.notas_texto).trim())
      .map((s) => ({ fecha_sesion: s.fecha_sesion, titulo: s.titulo, texto: String(s.notas_texto).trim().slice(0, 8000) }));

    if (notasTexto.length === 0) {
      throw new Error('Ninguna de las sesiones disponibles tiene contenido de nota.');
    }

    return await this.AiReportService.answerPatientQuestionAsync({
      pacienteNombre,
      nivelApoyoNombre,
      pregunta: String(pregunta).trim().slice(0, 500),
      sesionesPasadas: sesiones.map((s) => ({ fecha_sesion: s.fecha_sesion, titulo: s.titulo, estado: s.estado || 'completada' })),
      notasTexto,
    });
  };

  getByProfesionalIdAsync = async (idProfesional, idPerteneciente = null) => {
    return await this.ReporteProfesionalRepository.getByProfesionalIdAsync(idProfesional, idPerteneciente);
  };

  getForTutorAsync = async (idUsuarioTutor) => {
    return await this.ReporteProfesionalRepository.getByTutorUserIdAsync(idUsuarioTutor);
  };

  resolveProfesionalUsuarioIdAsync = async (idProfesional) => {
    const profesional = await this.ProfesionalRepository.getByIdAsync(idProfesional);
    if (!profesional?.id_usuario) {
      const error = new Error('No se pudo resolver el usuario del profesional.');
      error.statusCode = 404;
      throw error;
    }
    return profesional.id_usuario;
  };

  resolveTutorUserIdAsync = async (idPerteneciente) => {
    const vinculo = await this.VinculoTutorPertenecienteRepository.getTutorPrincipalByPertenecienteAsync(idPerteneciente);
    if (!vinculo) {
      const error = new Error('Este perteneciente no tiene un tutor principal vinculado.');
      error.statusCode = 404;
      throw error;
    }
    const tutor = await this.TutorRepository.getByIdAsync(vinculo.id_tutor);
    if (!tutor?.id_usuario) {
      const error = new Error('No se pudo resolver el usuario del tutor.');
      error.statusCode = 404;
      throw error;
    }
    return tutor.id_usuario;
  };

  resolveTipoMensajeTextoIdAsync = async () => {
    const tipos = await this.TipoMensajeRepository.getAllAsync();
    const texto = tipos.find((t) => String(t.nombre ?? '').trim().toLowerCase() === 'texto');
    return texto?.id ?? 1;
  };

  /** Trae el reporte y tira 404/403 si no existe o no es del profesional. */
  getOwnedReporteAsync = async (idReporte, idProfesional) => {
    if (!Number.isInteger(idReporte) || idReporte <= 0) throw badRequest('id de reporte invalido.');
    const reporte = await this.ReporteProfesionalRepository.getByIdAsync(idReporte);
    if (!reporte) {
      const error = new Error('Reporte no encontrado.');
      error.statusCode = 404;
      throw error;
    }
    if (Number(reporte.id_profesional) !== Number(idProfesional)) {
      const error = new Error('No autorizado para modificar este reporte.');
      error.statusCode = 403;
      throw error;
    }
    return reporte;
  };

  /** Edita titulo y/o contenido de un reporte propio que todavia no se envio al tutor. */
  updateAsync = async (idReporte, idProfesional, { titulo, contenido } = {}) => {
    console.log(`ReporteProfesionalService.updateAsync(${idReporte})`);
    const changes = {};
    if (titulo !== undefined) {
      const text = String(titulo).trim();
      if (!text || text.length > MAX_TITULO) throw badRequest(`El titulo es obligatorio (hasta ${MAX_TITULO} caracteres).`);
      changes.titulo = text;
    }
    if (contenido !== undefined) {
      const text = String(contenido).trim();
      if (!text || text.length > MAX_CONTENIDO) throw badRequest(`El texto del reporte es obligatorio (hasta ${MAX_CONTENIDO} caracteres).`);
      changes.contenido = text;
    }
    if (Object.keys(changes).length === 0) throw badRequest('Nada para actualizar: manda titulo o contenido.');

    const reporte = await this.getOwnedReporteAsync(idReporte, idProfesional);
    if (reporte.enviado_al_tutor) {
      const error = new Error('Este reporte ya se envio al tutor y no se puede editar.');
      error.statusCode = 409;
      throw error;
    }
    return await this.ReporteProfesionalRepository.updateAsync(reporte.id, changes);
  };

  /** Borra un reporte propio. */
  deleteAsync = async (idReporte, idProfesional) => {
    console.log(`ReporteProfesionalService.deleteAsync(${idReporte})`);
    const reporte = await this.getOwnedReporteAsync(idReporte, idProfesional);
    await this.ReporteProfesionalRepository.deleteAsync(reporte.id);
    return { rowsAffected: 1 };
  };

  sendToTutorAsync = async (idReporte, idUsuarioProfesional, idProfesional) => {
    console.log(`ReporteProfesionalService.sendToTutorAsync(${idReporte})`);
    const reporte = await this.ReporteProfesionalRepository.getByIdAsync(idReporte);
    if (!reporte) {
      const error = new Error('Reporte no encontrado.');
      error.statusCode = 404;
      throw error;
    }
    if (Number(reporte.id_profesional) !== Number(idProfesional)) {
      const error = new Error('No autorizado para enviar este reporte.');
      error.statusCode = 403;
      throw error;
    }

    const idUsuarioTutor = await this.resolveTutorUserIdAsync(reporte.id_perteneciente);
    const { chat } = await this.ChatService.createDirectChatAsync(idUsuarioProfesional, idUsuarioTutor, 1, null, {
      skipRelationshipValidation: true,
    });

    const idTipoMensajeTexto = await this.resolveTipoMensajeTextoIdAsync();
    await this.MensajeService.createFromUserAsync({
      id_chat: chat.id,
      id_usuario_emisor: idUsuarioProfesional,
      id_tipo_mensaje: idTipoMensajeTexto,
      fecha_envio: new Date(),
      contenido: `📄 ${reporte.titulo}\n\n${reporte.contenido}`,
    }, []);

    await this.NotificationProducerService.createAsync({
      recipientUserId: idUsuarioTutor,
      actorUserId: idUsuarioProfesional,
      contextUserId: idUsuarioTutor,
      typeName: 'Información',
      title: reporte.titulo,
      body: 'Tenes un nuevo reporte de tu profesional.',
      referenceType: 'reporte_profesional',
      referenceId: reporte.id,
    });

    return await this.ReporteProfesionalRepository.markSentAsync(reporte.id);
  };

  /**
   * Opciones (todas opcionales; sin ellas el PDF sale como siempre):
   * rango {desde, hasta, inicio, finExclusivo} reemplaza a anio/mes, pacientes limita a esos ids (con vinculo activo),
   * incluir es el Set de secciones (ia, asistencia, detalle). Sin 'ia' no se llama a la IA.
   */
  generateMonthlyPdfDataAsync = async (idProfesional, idUsuarioProfesional, anio, mes, { rango = null, pacientes: pacienteIds = null, incluir = new Set(DEFAULT_INCLUIR_MENSUAL) } = {}) => {
    console.log(`ReporteProfesionalService.generateMonthlyPdfDataAsync(${idProfesional}, ${rango ? `${rango.desde}..${rango.hasta}` : `${anio}, ${mes}`}, pacientes=${pacienteIds?.length ?? 'todos'})`);
    if (pacienteIds) await Promise.all(pacienteIds.map((id) => this.assertVinculoActivoAsync(idProfesional, id)));
    const [usuario, sesiones] = await Promise.all([
      this.UsuarioRepository.getByIdAsync(idUsuarioProfesional),
      this.SesionProfesionalRepository.getByProfesionalIdAsync(idProfesional),
    ]);

    const inicioMes = rango ? rango.inicio : new Date(Date.UTC(anio, mes - 1, 1));
    const finMes = rango ? rango.finExclusivo : new Date(Date.UTC(anio, mes, 1));
    const elegidos = pacienteIds ? new Set(pacienteIds) : null;
    const sesionesDelMes = sesiones.filter((s) => {
      const fecha = new Date(s.fecha_sesion);
      return fecha >= inicioMes && fecha < finMes && (!elegidos || elegidos.has(Number(s.id_perteneciente)));
    });

    const porPaciente = new Map();
    for (const sesion of sesionesDelMes) {
      const key = Number(sesion.id_perteneciente);
      if (!porPaciente.has(key)) porPaciente.set(key, []);
      porPaciente.get(key).push(sesion);
    }

    const pacientes = [];
    for (const [idPerteneciente, sesionesPaciente] of porPaciente) {
      const { pacienteNombre } = await this.buildPacienteContextAsync(idPerteneciente);
      const completadas = sesionesPaciente.filter((s) => s.estado === 'completada').length;
      const canceladas = sesionesPaciente.filter((s) => s.estado === 'cancelada').length;
      const ausentes = sesionesPaciente.filter((s) => s.estado === 'ausente').length;
      const asistenciaPct = completadas + ausentes > 0 ? Math.round((completadas / (completadas + ausentes)) * 100) : 0;
      const entry = { pacienteNombre, totalSesiones: sesionesPaciente.length, completadas, canceladas, ausentes, asistenciaPct };
      // Solo fecha, titulo, estado, duracion y si tiene nota: el contenido de las notas privadas nunca sale.
      if (incluir.has('detalle')) {
        entry.sesiones = sesionesPaciente
          .map((s) => ({ fecha_sesion: s.fecha_sesion, titulo: s.titulo, estado: s.estado, duracion_minutos: s.duracion_minutos, has_note: Boolean(s.has_note) }))
          .sort((a, b) => new Date(a.fecha_sesion).getTime() - new Date(b.fecha_sesion).getTime());
      }
      pacientes.push(entry);
    }

    const profesionalNombre = usuario?.nombre || usuario?.nombre_usuario || 'Profesional';
    const overviewText = incluir.has('ia') && pacientes.length > 0
      ? await this.AiReportService.generateCaseloadOverviewAsync({
        profesionalNombre, mes, anio, resumenPorPaciente: pacientes, periodoTexto: rango ? `${rango.desde} a ${rango.hasta}` : undefined,
      })
      : null;

    return { profesionalNombre, mes, anio, desde: rango?.desde ?? null, hasta: rango?.hasta ?? null, overviewText, pacientes, incluir: [...incluir] };
  };

  /** Opciones opcionales: rango {desde, hasta, inicio, finExclusivo} acota las sesiones; incluir es el Set (asistencia, detalle). */
  generatePatientHistoryPdfDataAsync = async (idProfesional, idUsuarioProfesional, idPerteneciente, { rango = null, incluir = new Set(DEFAULT_INCLUIR_HISTORIAL) } = {}) => {
    console.log(`ReporteProfesionalService.generatePatientHistoryPdfDataAsync(${idProfesional}, ${idPerteneciente})`);
    await this.assertVinculoActivoAsync(idProfesional, idPerteneciente);

    const [usuario, { pacienteNombre }, sesionesProfesional] = await Promise.all([
      this.UsuarioRepository.getByIdAsync(idUsuarioProfesional),
      this.buildPacienteContextAsync(idPerteneciente),
      this.SesionProfesionalRepository.getByProfesionalIdAsync(idProfesional),
    ]);

    const sesiones = sesionesProfesional
      .filter((s) => Number(s.id_perteneciente) === Number(idPerteneciente))
      .filter((s) => !rango || (new Date(s.fecha_sesion) >= rango.inicio && new Date(s.fecha_sesion) < rango.finExclusivo))
      .sort((a, b) => new Date(a.fecha_sesion).getTime() - new Date(b.fecha_sesion).getTime());

    const completadas = sesiones.filter((s) => s.estado === 'completada').length;
    const canceladas = sesiones.filter((s) => s.estado === 'cancelada').length;
    const ausentes = sesiones.filter((s) => s.estado === 'ausente').length;
    const asistenciaPct = completadas + ausentes > 0 ? Math.round((completadas / (completadas + ausentes)) * 100) : 0;

    return {
      profesionalNombre: usuario?.nombre || usuario?.nombre_usuario || 'Profesional',
      pacienteNombre,
      stats: { total: sesiones.length, completadas, canceladas, ausentes, asistenciaPct },
      sesiones,
      desde: rango?.desde ?? null,
      hasta: rango?.hasta ?? null,
      incluir: [...incluir],
    };
  };
}
