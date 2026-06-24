import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import ParticipanteChatService from '../services/ParticipanteChatService.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();
const currentService = new ParticipanteChatService();

router.use(authMiddleware);

router.put('/leer/:idChat', async (req, res) => {
  try {
    const idChat = parseInt(req.params.idChat);
    const idMensaje = req.body.id_mensaje ? parseInt(req.body.id_mensaje) : null;
    console.log(`ParticipanteChatController.marcarComoLeido(${idChat}, ${req.user.id}, ${idMensaje})`);
    await currentService.marcarComoLeidoAsync(idChat, req.user.id, idMensaje);
    res.status(StatusCodes.OK).json({ ok: true });
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.BAD_REQUEST).send(`Error: ${error.message}`);
  }
});

router.get('', async (req, res) => {
  try {
    console.log(`ParticipanteChatController.getAllBlocked(${req.user.id})`);
    res.status(StatusCodes.FORBIDDEN).send('No autorizado para listar participantes de chats.');
  } catch (error) {
    console.log(error);
    res.status(error.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
  }
});

router.get('/:id', async (req, res) => {
  try {
    console.log(`ParticipanteChatController.getByIdBlocked(${req.params.id}, user:${req.user.id})`);
    res.status(StatusCodes.FORBIDDEN).send('No autorizado para consultar participantes de chats por id.');
  } catch (error) {
    console.log(error);
    res.status(error.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
  }
});

router.post('', async (req, res) => {
  try {
    console.log(`ParticipanteChatController.createBlocked(${req.user.id})`);
    res.status(StatusCodes.FORBIDDEN).send('Usa PATCH /api/chats/:id/manage para administrar participantes.');
  } catch (error) {
    console.log(error);
    res.status(error.statusCode ?? StatusCodes.BAD_REQUEST).send(`Error: ${error.message}`);
  }
});

router.put('/:id', async (req, res) => {
  try {
    console.log(`ParticipanteChatController.updateBlocked(${req.params.id}, user:${req.user.id})`);
    res.status(StatusCodes.FORBIDDEN).send('Usa PATCH /api/chats/:id/manage para administrar participantes.');
  } catch (error) {
    console.log(error);
    res.status(error.statusCode ?? StatusCodes.BAD_REQUEST).send(`Error: ${error.message}`);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    console.log(`ParticipanteChatController.deleteBlocked(${req.params.id}, user:${req.user.id})`);
    res.status(StatusCodes.FORBIDDEN).send('Usa DELETE /api/chats/:id/me o PATCH /api/chats/:id/manage.');
  } catch (error) {
    console.log(error);
    res.status(error.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
  }
});

export default router;
