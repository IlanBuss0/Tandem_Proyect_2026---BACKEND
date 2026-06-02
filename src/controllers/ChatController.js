import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import ChatService from '../services/ChatService.js';
import Chat from '../entities/Chat.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { emitToUser } from '../realtime/realtime.js';

const router = Router();
const currentService = new ChatService();

router.get('', async (req, res) => {
  try {
    console.log('ChatController.getAll');
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

router.get('/me', authMiddleware, async (req, res) => {
  try {
    console.log(`ChatController.getMine(${req.user.id})`);
    const r = await currentService.getByUsuarioIdAsync(req.user.id);
    res.status(StatusCodes.OK).json(r);
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.BAD_REQUEST).send(`Error: ${error.message}`);
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
    res.status(StatusCodes.BAD_REQUEST).send(`Error: ${error.message}`);
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
    r.participantes.forEach((participante) => {
      emitToUser(participante.id_usuario, 'chat:new', r.chat);
    });
    res.status(StatusCodes.CREATED).json(r);
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.BAD_REQUEST).send(`Error: ${error.message}`);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    console.log(`ChatController.getById(${id})`);
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

router.post('', async (req, res) => {
  try {
    console.log('ChatController.create');
    const entity = new Chat(req.body);
    const newId = await currentService.createAsync(entity);
    if (newId > 0) {
      res.status(StatusCodes.CREATED).json({ message: `Se creo el chat con id: ${newId}`, id: newId });
    } else {
      res.status(StatusCodes.BAD_REQUEST).json({ message: 'No se pudo crear el chat.' });
    }
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.BAD_REQUEST).send(`Error: ${error.message}`);
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const entity = new Chat(req.body);
    console.log(`ChatController.update(${id})`);
    if (entity.id && parseInt(entity.id) !== id) {
      return res.status(StatusCodes.BAD_REQUEST).send(`El id de la URL (${id}) no coincide con el id del body (${entity.id}).`);
    }
    entity.id = id;
    const rowsAffected = await currentService.updateAsync(entity);
    if (rowsAffected !== 0) {
      res.status(StatusCodes.OK).json({ message: `Se actualizo el chat con id: ${id}`, rowsAffected });
    } else {
      res.status(StatusCodes.NOT_FOUND).send(`No se encontro el chat con id: ${id}.`);
    }
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.BAD_REQUEST).send(`Error: ${error.message}`);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    console.log(`ChatController.delete(${id})`);
    const rowCount = await currentService.deleteByIdAsync(id);
    if (rowCount !== 0) {
      res.status(StatusCodes.OK).json({ message: `Se desactivo el chat con id: ${id}`, rowsAffected: rowCount });
    } else {
      res.status(StatusCodes.NOT_FOUND).send(`No se encontro el chat con id: ${id}.`);
    }
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
  }
});

export default router;
