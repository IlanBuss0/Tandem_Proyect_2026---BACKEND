import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import MensajeService from '../services/MensajeService.js';
import Mensaje from '../entities/Mensaje.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { emitToUser } from '../realtime/realtime.js';
import ChatRepository from '../repositories/ChatRepository.js';

const router = Router();
const currentService = new MensajeService();
const chatRepository = new ChatRepository();

async function emitMessageToParticipants(message) {
  const participantes = await chatRepository.getActiveParticipantsAsync(message.id_chat);
  console.log(`[HTTP chat] message:new chat:${message.id_chat} message:${message.id} participantes:${participantes.map((p) => p.id_usuario).join(',')}`);
  participantes.forEach((participante) => {
    emitToUser(participante.id_usuario, 'message:new', message);
  });
}

async function emitMessageUpdateToParticipants(message) {
  const participantes = await chatRepository.getActiveParticipantsAsync(message.id_chat);
  console.log(`[HTTP chat] message:updated chat:${message.id_chat} message:${message.id} participantes:${participantes.map((p) => p.id_usuario).join(',')}`);
  participantes.forEach((participante) => {
    emitToUser(participante.id_usuario, 'message:updated', message);
  });
}

async function emitMessageDeletedToParticipants(message) {
  const payload = {
    id: message.id,
    id_chat: message.id_chat,
  };

  const participantes = await chatRepository.getActiveParticipantsAsync(message.id_chat);
  console.log(`[HTTP chat] message:deleted chat:${message.id_chat} message:${message.id} participantes:${participantes.map((p) => p.id_usuario).join(',')}`);
  participantes.forEach((participante) => {
    emitToUser(participante.id_usuario, 'message:deleted', payload);
  });
}

router.get('', authMiddleware, async (req, res) => {
  try {
    console.log(`MensajeController.getAllBlocked(${req.user.id})`);
    res.status(StatusCodes.FORBIDDEN).send('No autorizado para listar todos los mensajes.');
  } catch (error) {
    console.log(error);
    res.status(error.statusCode ?? StatusCodes.BAD_REQUEST).send(`Error: ${error.message}`);
  }
});

router.get('/chat/:idChat', authMiddleware, async (req, res) => {
  try {
    const idChat = parseInt(req.params.idChat);
    const requestedLimit = req.query.limit ? parseInt(req.query.limit) : 30;
    const limit = Math.min(Math.max(requestedLimit || 30, 1), 100);
    const beforeId = req.query.beforeId ? parseInt(req.query.beforeId) : null;
    const afterId = req.query.afterId ? parseInt(req.query.afterId) : null;
    if (beforeId && afterId) {
      return res.status(StatusCodes.BAD_REQUEST).send('Usa beforeId o afterId, no ambos.');
    }
    console.log(`MensajeController.getByChat(${idChat}) - limit: ${limit}, beforeId: ${beforeId}, afterId: ${afterId}`);
    const r = await currentService.getByChatForUserAsync(idChat, req.user.id, limit, beforeId, afterId);
    res.status(StatusCodes.OK).json(r);
  } catch (error) {
    console.log(error);
    res.status(error.statusCode ?? StatusCodes.BAD_REQUEST).send(`Error: ${error.message}`);
  }
});

router.get('/chat/:idChat/usuario/:idUsuario', authMiddleware, async (req, res) => {
  try {
    const idChat = parseInt(req.params.idChat);
    const idUsuario = parseInt(req.params.idUsuario);
    const requestedLimit = req.query.limit ? parseInt(req.query.limit) : 30;
    const limit = Math.min(Math.max(requestedLimit || 30, 1), 100);
    const beforeId = req.query.beforeId ? parseInt(req.query.beforeId) : null;
    const afterId = req.query.afterId ? parseInt(req.query.afterId) : null;
    if (beforeId && afterId) {
      return res.status(StatusCodes.BAD_REQUEST).send('Usa beforeId o afterId, no ambos.');
    }
    console.log(`MensajeController.getByChatForUsuario(${idChat}, ${idUsuario}) - limit: ${limit}, beforeId: ${beforeId}, afterId: ${afterId}`);
    if (idUsuario !== req.user.id) {
      return res.status(StatusCodes.FORBIDDEN).send('No autorizado para consultar mensajes de otro usuario.');
    }
    const r = await currentService.getByChatForUserAsync(idChat, idUsuario, limit, beforeId, afterId);
    res.status(StatusCodes.OK).json(r);
  } catch (error) {
    console.log(error);
    res.status(error.statusCode ?? StatusCodes.BAD_REQUEST).send(`Error: ${error.message}`);
  }
});

router.post('/chat/:idChat', authMiddleware, async (req, res) => {
  try {
    const idChat = parseInt(req.params.idChat);
    console.log(`MensajeController.createForChat(${idChat})`);
    const { id_archivos, ...bodyRest } = req.body;
    const entity = new Mensaje({
      ...bodyRest,
      id_chat: idChat,
      id_usuario_emisor: req.user.id,
      fecha_envio: req.body?.fecha_envio ?? new Date()
    });
    const message = await currentService.createFromUserAsync(entity, id_archivos);
    const fullMessage = await currentService.getByIdAsync(message.id);
    await emitMessageToParticipants(fullMessage || message);
    res.status(StatusCodes.CREATED).json(fullMessage || message);
  } catch (error) {
    console.log(error);
    res.status(error.statusCode ?? StatusCodes.BAD_REQUEST).send(`Error: ${error.message}`);
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const entity = new Mensaje(req.body);
    console.log(`MensajeController.updateFromUser(${id})`);
    entity.id = id;
    const rowsAffected = await currentService.updateFromUserAsync(entity, req.user.id);
    if (rowsAffected !== 0) {
      const message = await currentService.getByIdAsync(id);
      if (message) await emitMessageUpdateToParticipants(message);
      res.status(StatusCodes.OK).json({ message: `Se actualizo el mensaje con id: ${id}`, rowsAffected });
    } else {
      res.status(StatusCodes.NOT_FOUND).send(`No se encontro el mensaje con id: ${id}.`);
    }
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.BAD_REQUEST).send(`Error: ${error.message}`);
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    console.log(`MensajeController.deleteFromUser(${id})`);
    const message = await currentService.getByIdAsync(id);
    const rowCount = await currentService.deleteFromUserAsync(id, req.user.id);
    if (rowCount !== 0) {
      if (message) await emitMessageDeletedToParticipants(message);
      res.status(StatusCodes.OK).json({ message: `Se elimino el mensaje con id: ${id}`, rowsAffected: rowCount });
    } else {
      res.status(StatusCodes.NOT_FOUND).send(`No se encontro el mensaje con id: ${id}.`);
    }
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    console.log(`MensajeController.getById(${id})`);
    const r = await currentService.getByIdAsync(id);
    if (r != null) {
      await currentService.ParticipanteChatService.ensureActiveParticipantAsync(r.id_chat, req.user.id);
      res.status(StatusCodes.OK).json(r);
    } else {
      res.status(StatusCodes.NOT_FOUND).send(`No se encontro el mensaje con id: ${id}.`);
    }
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
  }
});

export default router;
