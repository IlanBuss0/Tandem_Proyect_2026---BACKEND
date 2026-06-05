import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import MensajeService from '../services/MensajeService.js';
import Mensaje from '../entities/Mensaje.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { emitToChat, emitToUser } from '../realtime/realtime.js';
import ChatRepository from '../repositories/ChatRepository.js';

const router = Router();
const currentService = new MensajeService();
const chatRepository = new ChatRepository();

async function emitMessageToParticipants(message) {
  emitToChat(message.id_chat, 'message:new', message);

  const participantes = await chatRepository.getActiveParticipantsAsync(message.id_chat);
  console.log(`[HTTP chat] message:new chat:${message.id_chat} message:${message.id} participantes:${participantes.map((p) => p.id_usuario).join(',')}`);
  participantes.forEach((participante) => {
    emitToUser(participante.id_usuario, 'message:new', message);
  });
}

router.get('', async (req, res) => {
  try {
    console.log('MensajeController.getAll');
    const r = await currentService.getAllAsync();
    if (r != null) {
      res.status(StatusCodes.OK).json(r);
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Error interno.');
    }
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
  }
});

router.get('/chat/:idChat', authMiddleware, async (req, res) => {
  try {
    const idChat = parseInt(req.params.idChat);
    const limit = req.query.limit ? parseInt(req.query.limit) : 30;
    const beforeId = req.query.beforeId ? parseInt(req.query.beforeId) : null;
    console.log(`MensajeController.getByChat(${idChat}) - limit: ${limit}, beforeId: ${beforeId}`);
    const r = await currentService.getByChatForUserAsync(idChat, req.user.id, limit, beforeId);
    res.status(StatusCodes.OK).json(r);
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.BAD_REQUEST).send(`Error: ${error.message}`);
  }
});

router.get('/chat/:idChat/usuario/:idUsuario', authMiddleware, async (req, res) => {
  try {
    const idChat = parseInt(req.params.idChat);
    const idUsuario = parseInt(req.params.idUsuario);
    const limit = req.query.limit ? parseInt(req.query.limit) : 30;
    const beforeId = req.query.beforeId ? parseInt(req.query.beforeId) : null;
    console.log(`MensajeController.getByChatForUsuario(${idChat}, ${idUsuario}) - limit: ${limit}, beforeId: ${beforeId}`);
    const r = await currentService.getByChatForUserAsync(idChat, idUsuario, limit, beforeId);
    res.status(StatusCodes.OK).json(r);
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.BAD_REQUEST).send(`Error: ${error.message}`);
  }
});

router.post('/chat/:idChat', authMiddleware, async (req, res) => {
  try {
    const idChat = parseInt(req.params.idChat);
    console.log(`MensajeController.createForChat(${idChat})`);
    const entity = new Mensaje({
      ...req.body,
      id_chat: idChat,
      id_usuario_emisor: req.user.id,
      fecha_envio: req.body?.fecha_envio ?? new Date()
    });
    const message = await currentService.createFromUserAsync(entity);
    await emitMessageToParticipants(message);
    res.status(StatusCodes.CREATED).json(message);
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.BAD_REQUEST).send(`Error: ${error.message}`);
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
      if (message) emitToChat(message.id_chat, 'message:updated', message);
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
      if (message) {
        emitToChat(message.id_chat, 'message:deleted', {
          id: message.id,
          id_chat: message.id_chat,
        });
      }
      res.status(StatusCodes.OK).json({ message: `Se elimino el mensaje con id: ${id}`, rowsAffected: rowCount });
    } else {
      res.status(StatusCodes.NOT_FOUND).send(`No se encontro el mensaje con id: ${id}.`);
    }
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    console.log(`MensajeController.getById(${id})`);
    const r = await currentService.getByIdAsync(id);
    if (r != null) {
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
