import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import ArchivoService from '../services/ArchivoService.js';
import FileStorageService from '../services/FileStorageService.js';
import Archivo from '../entities/Archivo.js';
import { upload, validateMagicBytes } from '../middlewares/upload.middleware.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();
const currentService = new ArchivoService();
const fileStorage = new FileStorageService();

function extractStoragePath(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    const match = u.pathname.match(/\/object\/public\/[^/]+\/(.+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

const IMAGE_MIMES = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']);

const TIPO_ARCHIVO_MAP = {
  imagen: 2,
  documento: 3,
  audio: 4,
  video: 5,
  otro: 6,
};

function inferIdTipoArchivo(mimetype, requested) {
  const parsed = parseInt(requested);
  if (!Number.isNaN(parsed) && parsed >= 1 && parsed <= 6) return parsed;
  if (IMAGE_MIMES.has(mimetype)) return TIPO_ARCHIVO_MAP.imagen;
  if (mimetype === 'application/pdf') return TIPO_ARCHIVO_MAP.documento;
  return TIPO_ARCHIVO_MAP.otro;
}

router.get('', authMiddleware, async (req, res) => {
  try {
    const r = await currentService.getAllAsync();
    res.status(StatusCodes.OK).json(r);
  } catch (error) {
    console.error('ArchivoController.getAll', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Error al obtener archivos.');
  }
});

router.post('/upload', authMiddleware, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      const message = err.code === 'LIMIT_FILE_SIZE'
        ? 'El archivo excede el limite de 10MB.'
        : `Archivo no valido: ${err.message}`;
      return res.status(StatusCodes.BAD_REQUEST).send(message);
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(StatusCodes.BAD_REQUEST).send('No se envio ningun archivo.');
    }

    const { buffer, originalname, mimetype, size } = req.file;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(StatusCodes.UNAUTHORIZED).send('Usuario no autenticado.');
    }

    if (!validateMagicBytes(buffer, mimetype)) {
      return res.status(StatusCodes.BAD_REQUEST).send('El contenido del archivo no coincide con el tipo declarado.');
    }

    const idTipoArchivo = inferIdTipoArchivo(mimetype, req.body.id_tipo_archivo);

    const result = await fileStorage.uploadAsync({
      buffer,
      contentType: mimetype,
      fileName: originalname,
      userId,
    });

    const entity = new Archivo({
      id_usuario_creador: userId,
      id_tipo_archivo: idTipoArchivo,
      nombre_archivo: originalname,
      url: result.url,
      fecha_subida: new Date(),
      activo: true,
    });

    const newId = await currentService.createAsync(entity);

    res.status(StatusCodes.CREATED).json({
      id: newId,
      url: result.url,
      nombre_archivo: originalname,
      content_type: mimetype,
      peso_bytes: size,
    });
  } catch (error) {
    console.error('ArchivoController.upload', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Error al subir el archivo.');
  }
});

router.get('/:id/download', authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(StatusCodes.BAD_REQUEST).send('ID invalido.');
    }

    const archivo = await currentService.getByIdAsync(id);
    if (!archivo) {
      return res.status(StatusCodes.NOT_FOUND).send('Archivo no encontrado.');
    }

    return res.redirect(archivo.url);
  } catch (error) {
    console.error('ArchivoController.download', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Error al descargar el archivo.');
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(StatusCodes.BAD_REQUEST).send('ID invalido.');
    }

    const r = await currentService.getByIdAsync(id);
    if (r != null) res.status(StatusCodes.OK).json(r);
    else res.status(StatusCodes.NOT_FOUND).send('Archivo no encontrado.');
  } catch (error) {
    console.error('ArchivoController.getById', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Error al obtener el archivo.');
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(StatusCodes.BAD_REQUEST).send('ID invalido.');
    }

    const entity = new Archivo(req.body);
    entity.id = id;
    const rowsAffected = await currentService.updateAsync(entity);
    if (rowsAffected !== 0) res.status(StatusCodes.OK).json({ rowsAffected });
    else res.status(StatusCodes.NOT_FOUND).send('Archivo no encontrado.');
  } catch (error) {
    console.error('ArchivoController.update', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Error al actualizar el archivo.');
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(StatusCodes.BAD_REQUEST).send('ID invalido.');
    }

    const archivo = await currentService.getByIdAsync(id);
    if (!archivo) {
      return res.status(StatusCodes.NOT_FOUND).send('Archivo no encontrado.');
    }

    const supabasePath = extractStoragePath(archivo.url);
    if (supabasePath) {
      await fileStorage.deleteAsync(supabasePath).catch((err) => {
        console.error(`Error al borrar de Supabase: ${err.message}`);
      });
    }

    const rowCount = await currentService.deleteByIdAsync(id);
    res.status(StatusCodes.OK).json({ rowsAffected: rowCount });
  } catch (error) {
    console.error('ArchivoController.delete', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Error al eliminar el archivo.');
  }
});

export default router;
