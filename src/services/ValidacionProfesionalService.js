import ValidacionProfesionalRepository from '../repositories/ValidacionProfesionalRepository.js';
import ProfesionalRepository from '../repositories/ProfesionalRepository.js';
import AppError from '../modules/errors/AppError.js';
import DniExtractionService from './DniExtractionService.js';
import RefepsPublicProvider from '../providers/professional-verification/RefepsPublicProvider.js';
import ProfessionalIdentityMatcher from './ProfessionalIdentityMatcher.js';
import { namesMatch, normalizeDocument } from '../modules/professional-verification/name-normalization.js';
import { VERIFICATION_METHOD, VERIFICATION_SOURCE, VERIFICATION_STATUS } from '../modules/professional-verification/verification.constants.js';

// Order shown to the user in the live verification checklist.
const VERIFICATION_STEPS = [
  { id: 'imagen', label: 'Foto del DNI recibida' },
  { id: 'codigo_barras', label: 'Código de barras leído' },
  { id: 'ocr', label: 'Lectura del texto (OCR, respaldo)' },
  { id: 'datos', label: 'Datos del DNI leídos' },
  { id: 'vigencia', label: 'DNI vigente' },
  { id: 'identidad', label: 'Nombre y apellido coinciden' },
  { id: 'documento', label: 'N° de DNI coincide con el registro' },
  { id: 'refeps', label: 'Matrícula encontrada en REFEPS' },
  { id: 'matricula', label: 'Matrícula habilitada' },
];

export default class ValidacionProfesionalService {
  constructor() {
    this.ValidacionProfesionalRepository = new ValidacionProfesionalRepository();
    this.ProfesionalRepository = new ProfesionalRepository();
    this.DniExtractionService = new DniExtractionService();
    this.RefepsProvider = new RefepsPublicProvider();
    this.IdentityMatcher = new ProfessionalIdentityMatcher();
  }

  getMineAsync = async (idUsuario) => {
    console.log(`ValidacionProfesionalService.getMineAsync(${idUsuario})`);
    const profesional = await this.ProfesionalRepository.getByUsuarioIdAsync(idUsuario);
    if (!profesional) throw new AppError('No tenes un perfil profesional creado.', 404);
    return await this.ValidacionProfesionalRepository.getByProfesionalIdAsync(profesional.id);
  };

  getByIdForUserAsync = async (idUsuario, id) => {
    console.log(`ValidacionProfesionalService.getByIdForUserAsync(${idUsuario}, ${id})`);
    const validacion = await this.ValidacionProfesionalRepository.getByIdAsync(id);
    if (!validacion) return null;

    const profesional = await this.ProfesionalRepository.getByUsuarioIdAsync(idUsuario);
    if (!profesional || profesional.id !== validacion.id_profesional) {
      throw new AppError('No autorizado para consultar esta validacion.', 403);
    }

    return validacion;
  };

  createMineAsync = async (idUsuario, { numero_matricula, titulo_profesional, documento_dni_url } = {}) => {
    console.log(`ValidacionProfesionalService.createMineAsync(${idUsuario})`);

    const profesional = await this.ProfesionalRepository.getByUsuarioIdAsync(idUsuario);
    if (!profesional) throw new AppError('No tenes un perfil profesional creado.', 404);

    const estadoPendiente = await this.ValidacionProfesionalRepository.getEstadoValidacionPendienteAsync();
    if (!estadoPendiente?.id) {
      throw new AppError('No se encontro un estado de validacion inicial configurado.', 500);
    }

    const entity = {
      id_profesional: profesional.id,
      numero_matricula: numero_matricula ?? profesional.matricula,
      titulo_profesional,
      documento_dni_url,
      id_estado_validacion: estadoPendiente.id,
      observacion: null,
      id_administrador_validador: null,
      fecha_validacion: null,
    };

    return await this.ValidacionProfesionalRepository.createAsync(entity);
  };

  verifyIdentityDataAsync = async ({ imageBuffer, matricula, declaredIdentity, pdf417Raw = null, refepsDni, jurisdiccion, codigo, profesion, selectionId } = {}) => {
    const numeroMatricula = this.validateMatricula(matricula);
    const identity = {
      nombre: String(declaredIdentity?.nombre || '').trim(),
      apellido: String(declaredIdentity?.apellido || '').trim(),
    };

    if (!identity.nombre || !identity.apellido) {
      throw new AppError('Nombre y apellido son obligatorios para validar la identidad profesional.', 400);
    }

    // Step-by-step trace for production debugging. Never logs personal data, only flags, counts and reasons.
    const traceId = Math.random().toString(36).slice(2, 8);
    const trace = (step, info = {}) => console.log(`[DniVerify ${traceId}] ${step}`, JSON.stringify(info));
    // Checklist returned to the client so the tester can see which stage passed or failed.
    const marks = new Map();
    const mark = (id, status, detail = null) => marks.set(id, { status, detail });
    const finish = (status, options = {}) => {
      trace('7. resultado', { status, reason: options.reason ?? null });
      const steps = VERIFICATION_STEPS.map(({ id, label }) => ({ id, label, ...(marks.get(id) ?? { status: 'skipped', detail: null }) }));
      return this.verificationResult(status, { ...options, steps });
    };
    mark('imagen', imageBuffer?.length ? 'ok' : 'fail', imageBuffer?.length ? null : 'No llegó la foto del DNI');
    trace('1. solicitud', {
      imageBytes: imageBuffer?.length ?? 0, pdf417Recibido: Boolean(pdf417Raw), pdf417Largo: pdf417Raw?.length ?? 0,
      conRefepsDni: Boolean(refepsDni), jurisdiccion: jurisdiccion ?? null,
    });

    const pdf417Data = pdf417Raw && typeof this.DniExtractionService.parsePdf417 === 'function'
      ? this.DniExtractionService.parsePdf417(pdf417Raw)
      : pdf417Raw && typeof this.DniExtractionService.parseText === 'function'
        ? this.DniExtractionService.parseText(pdf417Raw, 100)
        : null;
    if (!pdf417Raw) {
      trace('2. PDF417 no enviado por el cliente: se usara OCR');
      mark('codigo_barras', 'fail', 'La cámara no detectó el código de barras; se usó OCR');
    } else if (pdf417Data?.success) {
      mark('codigo_barras', 'ok', pdf417Data.layout === 'modern' ? 'Formato moderno' : 'Formato anterior');
      trace('2. PDF417 OK', {
        formato: pdf417Data.layout ?? null,
        vencimientoEstimado: pdf417Data.fechaVencimientoEstimada, expiryReason: pdf417Data.expiryReason ?? null,
      });
    } else {
      // diagnostics.shape is the layout with letters/digits masked, so it has no personal data.
      trace('2. PDF417 RECHAZADO: se usara OCR', { reason: pdf417Data?.reason, ...(pdf417Data?.diagnostics ?? {}) });
      mark('codigo_barras', 'fail', 'Se leyó el código pero no tiene el formato de un DNI; se usó OCR');
    }

    let dniData = pdf417Data;
    if (!pdf417Data?.success) {
      // A successful PDF417 read is authoritative: OCR only runs when the barcode is missing or unreadable.
      trace('3. OCR iniciado');
      const started = Date.now();
      dniData = await this.DniExtractionService.extractAsync(imageBuffer);
      mark('ocr', dniData.success ? 'ok' : 'fail', dniData.success ? null : `No se pudo leer el texto (${dniData.reason}${dniData.confidence != null ? `, confianza ${Math.round(dniData.confidence)}%` : ''})`);
      trace('3. OCR terminado', {
        ms: Date.now() - started, success: dniData.success, reason: dniData.reason ?? null, confianza: dniData.confidence ?? null,
        camposDetectados: dniData.detectedFields ?? [], conVencimiento: Boolean(dniData.fechaVencimiento),
      });
    }
    mark('datos', dniData.success ? 'ok' : 'fail', dniData.success ? (pdf417Data?.success ? 'Leídos del código de barras' : 'Leídos por OCR') : null);
    if (!dniData.success) return finish(VERIFICATION_STATUS.MANUAL_REVIEW, { reason: dniData.reason, dniData });
    if (!dniData.fechaVencimiento) {
      mark('vigencia', 'fail', 'No se pudo determinar la fecha de vencimiento');
      trace('4. sin vencimiento', { expiryReason: dniData.expiryReason ?? null });
      return finish(VERIFICATION_STATUS.MANUAL_REVIEW, { reason: dniData.expiryReason || 'UNVERIFIABLE_EXPIRY', dniData });
    }
    const expired = this.isExpired(dniData.fechaVencimiento);
    mark('vigencia', expired ? 'fail' : 'ok', expired ? 'El DNI ya expiró' : null);
    trace('4. vigencia', { vencido: expired, estimado: Boolean(dniData.fechaVencimientoEstimada), base: dniData.expiryBasis ?? null });
    if (expired) return finish(VERIFICATION_STATUS.EXPIRED_DOCUMENT, { reason: 'EXPIRED_DOCUMENT', dniData });

    const nombreOk = namesMatch(dniData.nombre, identity.nombre);
    const apellidoOk = namesMatch(dniData.apellido, identity.apellido);
    mark('identidad', nombreOk && apellidoOk ? 'ok' : 'fail', nombreOk && apellidoOk ? null : 'El nombre del DNI no coincide con el declarado');
    trace('5. nombre vs declarado', { nombreOk, apellidoOk });
    if (!nombreOk || !apellidoOk) return finish(VERIFICATION_STATUS.DATA_MISMATCH, { reason: 'DECLARED_IDENTITY_MISMATCH', dniData });
    if (refepsDni) {
      const documentOk = normalizeDocument(dniData.dni) === normalizeDocument(refepsDni);
      mark('documento', documentOk ? 'ok' : 'fail', documentOk ? null : 'El número de DNI no coincide con el del registro profesional');
      trace('5. DNI vs REFEPS', { documentOk });
      if (!documentOk) return finish(VERIFICATION_STATUS.DATA_MISMATCH, { reason: 'DOCUMENT_MISMATCH', dniData });
    }

    let refeps;
    try {
      if (refepsDni && jurisdiccion && typeof this.RefepsProvider.obtenerPerfil === 'function') {
        const selection = {
          matricula: numeroMatricula,
          dni: refepsDni,
          jurisdiccion,
          ...(selectionId ? { selectionId } : {}),
          ...(codigo ? { codigo } : {}),
          ...(profesion ? { profesion } : {}),
        };
        trace('6. REFEPS obtenerPerfil');
        const official = await this.RefepsProvider.obtenerPerfil(selection);
        refeps = { found: true, results: [official] };
      } else {
        trace('6. REFEPS buscarPorMatricula');
        refeps = await this.RefepsProvider.buscarPorMatricula(numeroMatricula);
      }
    } catch (error) {
      const reason = error.code || 'REFEPS_ERROR';
      mark('refeps', 'fail', `No se pudo consultar el registro profesional (${reason})`);
      console.error('[DniVerify] REFEPS fallo:', reason, error.message);
      return finish(VERIFICATION_STATUS.VERIFICATION_ERROR, { reason, dniData });
    }
    mark('refeps', refeps.found ? 'ok' : 'fail', refeps.found ? null : 'La matrícula no figura en el registro');
    trace('6. REFEPS respuesta', { found: Boolean(refeps.found), resultados: refeps.results?.length ?? 0 });
    if (!refeps.found) return finish(VERIFICATION_STATUS.NOT_FOUND, { dniData });

    const match = this.IdentityMatcher.match({ dniData, numeroMatricula, refepsResults: refeps.results });
    mark('matricula', match.matched && match.active && !match.ambiguous ? 'ok' : 'fail',
      match.ambiguous ? 'Hay más de un resultado posible' : !match.matched ? 'Los datos no coinciden con el registro' : !match.active ? 'La matrícula no está habilitada' : null);
    trace('6. matcher', { matched: Boolean(match.matched), ambiguous: Boolean(match.ambiguous), active: Boolean(match.active) });
    if (match.ambiguous) return finish(VERIFICATION_STATUS.MANUAL_REVIEW, { reason: 'AMBIGUOUS_RESULTS', dniData });
    if (!match.matched) return finish(VERIFICATION_STATUS.DATA_MISMATCH, { dniData });
    if (!match.active) {
      return finish(VERIFICATION_STATUS.MANUAL_REVIEW, { reason: 'INACTIVE_LICENSE', result: match.result, dniData });
    }

    return finish(VERIFICATION_STATUS.VERIFIED, { result: match.result, dniData });
  };

  verifyRegistrationAsync = async ({ idUsuario, verifiedResult }) => {
    const profesional = await this.ProfesionalRepository.getByUsuarioIdAsync(idUsuario);
    if (!profesional) throw new AppError('No tenes un perfil profesional creado.', 404);

    const result = verifiedResult;
    if (result?.status !== VERIFICATION_STATUS.VERIFIED || String(result.result?.matricula) !== String(profesional.matricula)) {
      throw new AppError('La identidad profesional debe verificarse antes de crear la cuenta.', 422);
    }

    console.info('[ProfessionalVerification] verification succeeded');
    return this.persistResult(profesional, VERIFICATION_STATUS.VERIFIED, { result: result.result });
  };

  validateMatricula(value) {
    const matricula = String(value || '').trim();
    if (!/^\d{4,}$/.test(matricula)) {
      throw new AppError('La matrícula debe tener al menos 4 dígitos.', 400, 'INVALID_LICENSE');
    }
    return matricula;
  }

  isExpired(value, now = new Date()) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return true;
    const expiry = new Date(`${value}T00:00:00Z`);
    if (Number.isNaN(expiry.getTime()) || expiry.toISOString().slice(0, 10) !== value) return true;
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
    return value <= today;
  }

  verificationResult(status, { reason = null, result = null, dniData = null, steps = undefined } = {}) {
    const reviewStatus = [VERIFICATION_STATUS.VERIFICATION_ERROR, VERIFICATION_STATUS.NOT_FOUND].includes(status)
      ? VERIFICATION_STATUS.MANUAL_REVIEW
      : status;
    return {
      status,
      reviewStatus,
      verified: status === VERIFICATION_STATUS.VERIFIED,
      reason,
      result,
      dni: dniData ? {
        nombre: dniData.nombre,
        apellido: dniData.apellido,
        dni: dniData.dni,
        nombreCompleto: dniData.nombreCompleto,
        fechaVencimiento: dniData.fechaVencimiento,
        fechaVencimientoEstimada: Boolean(dniData.fechaVencimientoEstimada),
        fuente: dniData.source === 'PDF417' ? 'PDF417' : 'OCR',
        confidence: dniData.confidence,
        structureScore: dniData.structureScore,
        detectedFields: dniData.detectedFields,
      } : null,
      ...(steps ? { steps } : {}),
      messageCode: this.messageCode(status),
    };
  }

  persistResult = async (profesional, status, { reason = null, result = null } = {}) => {
    const effectiveStatus = [VERIFICATION_STATUS.VERIFICATION_ERROR, VERIFICATION_STATUS.NOT_FOUND].includes(status)
      ? VERIFICATION_STATUS.MANUAL_REVIEW
      : status;
    await this.ValidacionProfesionalRepository.createAutomatedResultAsync({
      id_profesional: profesional.id,
      numero_matricula: profesional.matricula,
      status,
      profile_status: effectiveStatus,
      source: VERIFICATION_SOURCE,
      verification_method: VERIFICATION_METHOD,
      profesion: result?.profesion ?? profesional.profesion,
      jurisdiccion: result?.jurisdiccion ?? null,
      observacion: reason,
      fecha_validacion: new Date(),
    });
    return { status, reviewStatus: effectiveStatus, messageCode: this.messageCode(status) };
  };

  messageCode(status) {
    if (status === VERIFICATION_STATUS.VERIFIED) return 'PROFESSIONAL_CREDENTIALS_VERIFIED';
    if (status === VERIFICATION_STATUS.DATA_MISMATCH) return 'PROFESSIONAL_DATA_MISMATCH';
    return 'PROFESSIONAL_VERIFICATION_PENDING';
  }
}
