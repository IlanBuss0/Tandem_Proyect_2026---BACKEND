import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import ChatService from '../services/ChatService.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { emitToUser } from '../realtime/realtime.js';
import ParticipanteChatService from '../services/ParticipanteChatService.js';
import { upload, validateMagicBytes } from '../middlewares/upload.middleware.js';
import { isImageMime } from '../services/ImageProcessingService.js';

const router = Router();
const currentService = new ChatService();
const participanteChatService = new ParticipanteChatService();

router.get('', authMiddleware, async (req, res) => {
  try {
    console.log(`ChatController.getAllForUser(${req.user.id})`);
    const r = await currentService.getByUsuarioIdAsync(req.user.id);
    res.status(StatusCodes.OK).json(r);
  } catch (error) {
    console.log(error);
    res.status(error.statusCode ?? StatusCodes.BAD_REQUEST).send(`Error: ${error.message}`);
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    console.log(`ChatController.getMine(${req.user.id})`);
    const r = await currentService.getByUsuarioIdAsync(req.user.id);
    res.status(StatusCodes.OK).json(r);
  } catch (error) {
    console.log(error);
    res.status(error.statusCode ?? StatusCodes.BAD_REQUEST).send(`Error: ${error.message}`);
  }
});

router.get('/sync', authMiddleware, async (req, res) => {
  try {
    const since = req.query.since ? String(req.query.since) : null;
    console.log(`ChatController.sync(${req.user.id}, since:${since})`);
    const r = await currentService.syncByUsuarioIdAsync(req.user.id, since);
    console.log(`[HTTP chat] sync user:${req.user.id} since:${since || 'full'} chats:${r.chats.length}`);
    res.status(StatusCodes.OK).json(r);
  } catch (error) {
    console.log(error);
    res.status(error.statusCode ?? StatusCodes.BAD_REQUEST).send(`Error: ${error.message}`);
  }
});

router.get('/usuario/:idUsuario', authMiddleware, async (req, res) => {
  try {
    const idUsuario = parseInt(req.params.idUsuario);
    console.log(`ChatController.getByUsuario(${idUsuario}, requester:${req.user.id})`);
    if (idUsuario !== req.user.id) {
      return res.status(StatusCodes.FORBIDDEN).send('No autorizado para consultar chats de otro usuario.');
    }
    const r = await currentService.getByUsuarioIdAsync(idUsuario);
    res.status(StatusCodes.OK).json(r);
  } catch (error) {
    console.log(error);
    res.status(error.statusCode ?? StatusCodes.BAD_REQUEST).send(`Error: ${error.message}`);
  }
});

router.post('/direct', authMiddleware, async (req, res) => {
    try {
        const { id_usuario_destino, id_tipo_chat, nombre } = req.body;
        console.log(`ChatController.createDirect(${req.user.id} -> ${id_usuario_destino})`);
        const r = await currentService.createDirectChatAsync(
            req.user.id, 
            parseInt(id_usuario_destino), 
            id_tipo_chat ? parseInt(id_tipo_chat) : 1, 
            nombre
        );
        console.log(`[HTTP chat] chat:new direct chat:${r.chat.id} participantes:${r.participantes.map((p) => p.id_usuario).join(',')}`);
        r.participantes.forEach((participante) => {
          emitToUser(participante.id_usuario, 'chat:new', {
            chat: r.chat,
            participantes: r.participantes,
          });
        });
        res.status(r.created ? StatusCodes.CREATED : StatusCodes.OK).json(r.chat);
    } catch (error) {
        console.log(error);
        res.status(StatusCodes.BAD_REQUEST).send(`Error: ${error.message}`);
    }
});

router.post('/profesional-perteneciente', authMiddleware, async (req, res) => {
  try {
    console.log(`ChatController.createProfesionalPerteneciente(${req.user.id})`);
    const r = await currentService.createProfesionalPertenecienteAsync({
      id_usuario_profesional: req.user.id,
      id_perteneciente: parseInt(req.body?.id_perteneciente),
      id_tipo_chat: req.body?.id_tipo_chat ? parseInt(req.body.id_tipo_chat) : null,
      nombre: req.body?.nombre ?? null
    });
    res.status(r.created ? StatusCodes.CREATED : StatusCodes.OK).json(r);
  } catch (error) {
    console.log(error);
    res.status(error.statusCode ?? StatusCodes.BAD_REQUEST).send(`Error: ${error.message}`);
  }
});

router.post('/group', authMiddleware, async (req, res) => {
  try {
    console.log(`ChatController.createGroup(${req.user.id})`);
    const r = await currentService.createGroupChatAsync({
      id_usuario_creador: req.user.id,
      participantes: req.body?.participantes ?? req.body?.ids_usuarios ?? [],
      nombre: req.body?.nombre,
      descripcion: req.body?.descripcion ?? null,
      id_tipo_chat: req.body?.id_tipo_chat ? parseInt(req.body.id_tipo_chat) : null,
    });
    console.log(`[HTTP chat] chat:new group chat:${r.chat.id} participantes:${r.participantes.map((p) => p.id_usuario).join(',')}`);
    r.participantes.forEach((participante) => {
      emitToUser(participante.id_usuario, 'chat:new', {
        chat: r.chat,
        participantes: r.participantes,
      });
    });
    res.status(StatusCodes.CREATED).json(r);
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.BAD_REQUEST).send(`Error: ${error.message}`);
  }
});

router.patch('/:id/manage', authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    console.log(`ChatController.manage(${id}, user:${req.user.id})`);
    const r = await currentService.manageForUserAsync(id, req.user.id, req.body);

    r.participantes.forEach((participante) => {
      emitToUser(participante.id_usuario, 'chat:updated', {
        chat: r.chat,
        participantes: r.participantes,
      });
      emitToUser(participante.id_usuario, 'chat:new', {
        chat: r.chat,
        participantes: r.participantes,
      });
    });

    res.status(StatusCodes.OK).json(r);
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.BAD_REQUEST).send(`Error: ${error.message}`);
  }
});

router.post('/:id/avatar', authMiddleware, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      const message = err.code === 'LIMIT_FILE_SIZE'
        ? 'La imagen excede el limite de 10MB.'
        : `Imagen no valida: ${err.message}`;
      return res.status(StatusCodes.BAD_REQUEST).send(message);
    }
    next();
  });
}, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!req.file) {
      return res.status(StatusCodes.BAD_REQUEST).send('No se envio ninguna imagen.');
    }
    if (!isImageMime(req.file.mimetype)) {
      return res.status(StatusCodes.BAD_REQUEST).send('La foto del chat debe ser una imagen.');
    }
    if (!validateMagicBytes(req.file.buffer, req.file.mimetype)) {
      return res.status(StatusCodes.BAD_REQUEST).send('El contenido de la imagen no coincide con el tipo declarado.');
    }

    const r = await currentService.setAvatarForUserAsync(id, req.user.id, req.file);

    r.participantes.forEach((participante) => {
      emitToUser(participante.id_usuario, 'chat:updated', {
        chat: r.chat,
        participantes: r.participantes,
      });
      emitToUser(participante.id_usuario, 'chat:new', {
        chat: r.chat,
        participantes: r.participantes,
      });
    });

    res.status(StatusCodes.OK).json({
      avatar_url: r.chat.avatar_url,
      avatar_content_type: r.chat.avatar_content_type,
      avatar_actualizada_en: r.chat.avatar_actualizada_en,
      chat: r.chat,
      participantes: r.participantes,
    });
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.BAD_REQUEST).send(`Error: ${error.message}`);
  }
});

router.delete('/:id/me', authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    console.log(`ChatController.hideForMe(${id}, user:${req.user.id})`);
    const participantes = await currentService.ChatRepository.getActiveParticipantsAsync(id);
    const rowsAffected = participantes.length > 2
      ? await participanteChatService.leaveForUserAsync(id, req.user.id)
      : await participanteChatService.hideForUserAsync(id, req.user.id);
    res.status(StatusCodes.OK).json({ ok: true, rowsAffected, mode: participantes.length > 2 ? 'left_group' : 'hidden_for_me' });
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.BAD_REQUEST).send(`Error: ${error.message}`);
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    console.log(`ChatController.getById(${id})`);
    await participanteChatService.ensureActiveParticipantAsync(id, req.user.id);
    const r = await currentService.getByIdAsync(id);
    if (r != null) {
      res.status(StatusCodes.OK).json(r);
    } else {
      res.status(StatusCodes.NOT_FOUND).send(`No se encontro el chat con id: ${id}.`);
    }
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
  }
});

router.post('', authMiddleware, async (req, res) => {
  try {
    console.log(`ChatController.createBlocked(${req.user.id})`);
    res.status(StatusCodes.FORBIDDEN).send('Usa los endpoints especificos de chat direct, group o profesional-perteneciente.');
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.BAD_REQUEST).send(`Error: ${error.message}`);
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    console.log(`ChatController.updateBlocked(${req.params.id}, user:${req.user.id})`);
    res.status(StatusCodes.FORBIDDEN).send('Usa PATCH /api/chats/:id/manage para administrar grupos.');
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.BAD_REQUEST).send(`Error: ${error.message}`);
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    console.log(`ChatController.deleteBlocked(${req.params.id}, user:${req.user.id})`);
    res.status(StatusCodes.FORBIDDEN).send('Usa DELETE /api/chats/:id/me para ocultar o salir de un chat.');
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
  }
});

export default router;
