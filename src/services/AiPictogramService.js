import crypto from 'crypto';
import axios from 'axios';
import sharp from 'sharp';
import AiPictogramRepository from '../repositories/AiPictogramRepository.js';
import PictogramaRepository from '../repositories/PictogramaRepository.js';
import FileStorageService from './FileStorageService.js';
import AuthorizationService from './AuthorizationService.js';
import AppError from '../modules/errors/AppError.js';

const QUICK_MODEL = 'fal-ai/flux/schnell';
const FINAL_MODEL = 'fal-ai/flux-2-pro';
const FINAL_EDIT_MODEL = 'fal-ai/flux-2-pro/edit';
const ALLOWED_CATEGORIES = new Set([
  'acciones y rutinas', 'actividades', 'casa', 'comida', 'comunicacion',
  'compras y dinero', 'conceptos', 'emociones', 'escuela y aprendizaje',
  'higiene', 'lugares', 'naturaleza', 'objetos', 'ocio', 'personas',
  'salud y cuerpo', 'tecnologia', 'tiempo', 'transporte', 'vida diaria', 'otros',
]);
const BLOCKED_TEXT = /(?:porn|desnud|sexual|arma|sangre|suicid|autolesi|odio|nazi)/i;

function cleanText(value, max) {
  return String(value || '').trim().replace(/\s+/g, ' ').slice(0, max);
}

function buildPrompt(name, description) {
  return [
    `Create one accessible AAC pictogram representing: ${name}.`,
    `Meaning and context: ${description}.`,
    'Square composition, one clear centered subject, simple flat vector illustration, thick rounded outlines, high contrast, friendly neutral appearance.',
    'Plain white or transparent-looking background, no scenery unless essential to meaning, no written words, no letters, no logos, no watermark, no border.',
    'The result must be immediately understandable for a person who uses augmentative and alternative communication.',
  ].join(' ');
}

export default class AiPictogramService {
  constructor() {
    this.repository = new AiPictogramRepository();
    this.pictograms = new PictogramaRepository();
    this.storage = new FileStorageService();
  }

  ensureSchemaAsync = async () => {
    await this.pictograms.ensureSchemaAsync();
    await this.repository.ensureSchemaAsync();
  };

  getTargetsAsync = async (userId) => {
    const context = await AuthorizationService.getPermissionContext(userId);
    if (context.tutor) {
      return (context.pertenecientes || []).map(item => ({
        id: item.id,
        name: `${item.usuario?.nombre || ''} ${item.usuario?.apellido || ''}`.trim() || item.usuario?.nombre_usuario,
      }));
    }
    if (context.profesional) {
      return (context.vinculos || [])
        .filter(item => item.vinculo?.fue_aprobado_por_tutor !== false)
        .map(item => ({
          id: item.perteneciente.id,
          name: `${item.perteneciente.usuario?.nombre || ''} ${item.perteneciente.usuario?.apellido || ''}`.trim()
            || item.perteneciente.usuario?.nombre_usuario,
        }));
    }
    throw new AppError('Solo tutores y profesionales pueden crear pictogramas con IA.', 403);
  };

  assertTargetAsync = async (userId, targetId) => {
    const targets = await this.getTargetsAsync(userId);
    if (!targets.some(item => Number(item.id) === Number(targetId))) {
      throw new AppError('No tenes un vinculo activo con el perteneciente seleccionado.', 403);
    }
  };

  prepareReferenceAsync = async ({ file, referencePictogramId, userId, generationId }) => {
    if (file) {
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.mimetype)) {
        throw new AppError('La referencia debe ser PNG, JPG o WebP.', 400);
      }
      if (file.size > 8 * 1024 * 1024) throw new AppError('La referencia no puede superar 8 MB.', 400);
      let buffer;
      try {
        buffer = await sharp(file.buffer, { failOn: 'error' })
          .rotate().resize(1536, 1536, { fit: 'inside', withoutEnlargement: true })
          .png({ compressionLevel: 9 }).toBuffer();
      } catch {
        throw new AppError('La imagen de referencia no es valida.', 400);
      }
      const stored = await this.storage.uploadAsync({
        buffer, contentType: 'image/png', fileName: 'reference.png', userId,
        path: `pictograms-ai/temp/${generationId}/reference.png`, upsert: true,
      });
      return { type: 'upload', url: stored.url, path: stored.path };
    }
    if (referencePictogramId) {
      const pictogram = await this.pictograms.getByExternalIdAsync(referencePictogramId, 'es');
      if (!pictogram?.imageUrl) throw new AppError('El pictograma de referencia no existe.', 404);
      return { type: 'catalog', url: pictogram.imageUrl, pictogramId: pictogram.id };
    }
    return null;
  };

  callPollinationsAsync = async ({ prompt, referenceUrl }) => {
    const encodedPrompt = encodeURIComponent(prompt);
    let url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&model=flux&nologo=true`;
    if (referenceUrl) {
      url += `&image=${encodeURIComponent(referenceUrl)}`;
    }
    const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 60000 });
    return Buffer.from(response.data);
  };

  callFalAsync = async ({ model, prompt, referenceUrl }) => {
    if (!process.env.FAL_KEY) throw new AppError('La generacion IA no esta configurada.', 503);
    const endpoint = `https://fal.run/${model}`;
    const input = {
      prompt,
      image_size: 'square_hd',
      num_images: 1,
      output_format: 'png',
      enable_safety_checker: true,
      safety_tolerance: '1',
      ...(referenceUrl ? { image_urls: [referenceUrl] } : {}),
    };
    const response = await axios.post(endpoint, input, {
      headers: { Authorization: `Key ${process.env.FAL_KEY}`, 'Content-Type': 'application/json' },
      timeout: Number.parseInt(process.env.FAL_REQUEST_TIMEOUT_MS || '120000', 10),
    });
    if (response.data?.has_nsfw_concepts?.some(Boolean)) {
      throw new AppError('La imagen fue bloqueada por el control de seguridad.', 422);
    }
    const image = response.data?.images?.[0];
    if (!image?.url) throw new Error('fal.ai no devolvio una imagen.');
    return { image, requestId: response.headers?.['x-fal-request-id'] || null, seed: response.data?.seed ?? null };
  };

  generateAsync = async ({ userId, body, file }) => {
    await this.ensureSchemaAsync();
    const name = cleanText(body.name, 160);
    const description = cleanText(body.description, 1200);
    const category = cleanText(body.category, 100).toLowerCase() || 'otros';
    const mode = body.mode === 'quick' ? 'quick' : 'final';
    const targetPertenecienteId = Number(body.targetPertenecienteId);
    if (name.length < 2 || description.length < 5) throw new AppError('Completa nombre y descripcion.', 400);
    if (BLOCKED_TEXT.test(`${name} ${description}`)) throw new AppError('La solicitud no supera el control de contenido.', 422);
    if (!ALLOWED_CATEGORIES.has(category)) throw new AppError('La categoria no es valida.', 400);
    if (!Number.isInteger(targetPertenecienteId) || targetPertenecienteId <= 0) throw new AppError('Selecciona un perteneciente.', 400);
    await this.assertTargetAsync(userId, targetPertenecienteId);

    const hasFalKey = process.env.FAL_KEY && process.env.FAL_KEY !== 'replace-with-fal-api-key';
    const id = crypto.randomUUID();
    const reference = await this.prepareReferenceAsync({
      file, referencePictogramId: body.referencePictogramId, userId, generationId: id,
    });

    if (mode === 'quick' && reference) {
      if (reference.path) await this.storage.deleteAsync(reference.path).catch(() => undefined);
      throw new AppError('Las referencias se aplican en modo final. Usa modo final o quita la referencia.', 400);
    }
    const model = hasFalKey ? (mode === 'quick' ? QUICK_MODEL : reference ? FINAL_EDIT_MODEL : FINAL_MODEL) : 'pollinations-flux';
    const prompt = buildPrompt(name, description);
    const generation = await this.repository.createGenerationAsync({
      id, creatorUserId: userId, targetPertenecienteId, name, description, category,
      mode, model, prompt, referenceType: reference?.type,
      referencePictogramId: reference?.pictogramId, referenceUrl: reference?.url,
      referencePath: reference?.path, referenceHadPeople: body.referenceHadPeople === 'true',
    });

    try {
      let imageBuffer;
      let providerRequestId = null;
      let seed = null;

      if (hasFalKey) {
        try {
          const result = await this.callFalAsync({ model, prompt, referenceUrl: reference?.url });
          const downloaded = await axios.get(result.image.url, { responseType: 'arraybuffer', timeout: 60000 });
          imageBuffer = await sharp(Buffer.from(downloaded.data)).resize(1024, 1024, { fit: 'cover' }).png({ compressionLevel: 9 }).toBuffer();
          providerRequestId = result.requestId;
          seed = result.seed;
        } catch (falError) {
          console.warn('Fal AI failed. Falling back to Pollinations AI...', falError.message || falError);
          const rawBuffer = await this.callPollinationsAsync({ prompt, referenceUrl: reference?.url });
          imageBuffer = await sharp(rawBuffer).resize(1024, 1024, { fit: 'cover' }).png({ compressionLevel: 9 }).toBuffer();
        }
      } else {
        const rawBuffer = await this.callPollinationsAsync({ prompt, referenceUrl: reference?.url });
        imageBuffer = await sharp(rawBuffer).resize(1024, 1024, { fit: 'cover' }).png({ compressionLevel: 9 }).toBuffer();
      }

      const stored = await this.storage.uploadAsync({
        buffer: imageBuffer, contentType: 'image/png', fileName: `${id}.png`, userId,
        path: `pictograms-ai/previews/${id}.png`, upsert: true,
      });
      return await this.repository.completeGenerationAsync(id, {
        previewUrl: stored.url, previewPath: stored.path, providerRequestId, seed,
      });
    } catch (error) {
      await this.repository.failGenerationAsync(id, error.message);
      throw error;
    }
  };

  getGenerationForOwnerAsync = async (id, userId) => {
    const generation = await this.repository.getGenerationAsync(id);
    if (!generation || Number(generation.creatorUserId) !== Number(userId)) throw new AppError('Generacion no encontrada.', 404);
    return generation;
  };

  saveAsync = async (id, userId, body) => {
    const generation = await this.getGenerationForOwnerAsync(id, userId);
    if (!['ready', 'saved'].includes(generation.status) || !generation.previewUrl) throw new AppError('La vista previa no esta lista.', 409);
    const targetIds = Array.isArray(body?.targetPertenecienteIds)
      ? body.targetPertenecienteIds.map(Number).filter(Boolean)
      : [];
    return await this.repository.saveGenerationAsync(generation, targetIds);
  };

  discardAsync = async (id, userId) => {
    const generation = await this.getGenerationForOwnerAsync(id, userId);
    if (generation.status === 'saved') throw new AppError('Una creacion guardada no puede descartarse desde la vista previa.', 409);
    await Promise.all([
      generation.previewPath ? this.storage.deleteAsync(generation.previewPath).catch(() => undefined) : null,
      generation.referencePath ? this.storage.deleteAsync(generation.referencePath).catch(() => undefined) : null,
    ]);
    await this.repository.failGenerationAsync(id, 'discarded');
    return { discarded: true };
  };

  listMineAsync = async (userId) => { await this.ensureSchemaAsync(); return this.repository.listPrivateAsync(userId); };
  listAvailableAsync = async (userId) => {
    await this.ensureSchemaAsync();
    const context = await AuthorizationService.getPermissionContext(userId);
    if (!context.perteneciente?.id) throw new AppError('Solo disponible para pertenecientes.', 403);
    return this.repository.listForTargetAsync(context.perteneciente.id);
  };
  submitAsync = async (id, userId) => {
    const result = await this.repository.submitAsync(id, userId);
    if (!result) throw new AppError('Pictograma no encontrado o no editable.', 404);
    return result;
  };
  updateCreationAsync = async (id, userId, body) => {
    const name = cleanText(body.name, 160);
    const description = cleanText(body.description, 1200);
    const category = cleanText(body.category, 100).toLowerCase();
    if (name.length < 2 || !ALLOWED_CATEGORIES.has(category)) throw new AppError('Nombre o categoria invalidos.', 400);
    const result = await this.repository.updateCreationAsync(id, userId, { name, category });
    if (!result) throw new AppError('Pictograma no encontrado o no editable.', 404);
    await this.repository.updateGenerationDescriptionAsync(id, userId, description);
    return { ...result, description };
  };

  assertAdminAsync = async (userId) => {
    const context = await AuthorizationService.getUserContext(userId);
    if (Number(context?.usuario?.id_tipo_usuario) !== 4) throw new AppError('Solo administradores.', 403);
  };
  listModerationAsync = async (userId) => { await this.assertAdminAsync(userId); return this.repository.listModerationAsync(); };
  reviewAsync = async (id, userId, body) => {
    await this.assertAdminAsync(userId);
    const approved = body.decision === 'approve';
    const reason = cleanText(body.reason, 600);
    if (!approved && reason.length < 3) throw new AppError('Indica el motivo del rechazo.', 400);
    const result = await this.repository.reviewAsync(id, userId, approved, reason);
    if (!result) throw new AppError('Pictograma pendiente no encontrado.', 404);
    return result;
  };
}
