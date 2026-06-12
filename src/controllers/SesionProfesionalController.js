import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';

import SesionProfesionalService from '../services/SesionProfesionalService.js';
import SesionProfesional from '../entities/SesionProfesional.js';
import AuthorizationService from '../services/AuthorizationService.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { AUTH_ACTIONS, PROFESIONAL_PERMISSIONS } from '../modules/security/permissions.constants.js';

const router = Router();
const currentService = new SesionProfesionalService();

router.use(authMiddleware);

router.get('', async (req, res) => {
  try {
    console.log('SesionProfesionalController.getAll');
    const idPerteneciente = Number(req.query.id_perteneciente);
    const idProfesional = Number(req.query.id_profesional);
    const context = await AuthorizationService.getUserContext(req.user.id);
    let returnArray = null;

    if (idPerteneciente) {
      await AuthorizationService.assertCanReadPertenecienteResource(
        req.user.id,
        idPerteneciente,
        PROFESIONAL_PERMISSIONS.VER_HISTORIAL,
      );
      returnArray = await currentService.getByPertenecienteIdAsync(idPerteneciente);
    } else if (idProfesional) {
      if (context?.profesional?.id !== idProfesional) {
        return res.status(StatusCodes.FORBIDDEN).send('No autorizado para consultar sesiones de otro profesional.');
      }
      returnArray = await currentService.getByProfesionalIdAsync(idProfesional);
    } else if (context?.profesional?.id) {
      returnArray = await currentService.getByProfesionalIdAsync(context.profesional.id);
    } else if (context?.perteneciente?.id) {
      returnArray = await currentService.getByPertenecienteIdAsync(context.perteneciente.id);
    } else {
      return res.status(StatusCodes.FORBIDDEN).send('No autorizado para listar sesiones profesionales.');
    }

    if (returnArray != null) {
      res.status(StatusCodes.OK).json(returnArray);
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Error interno.');
    }
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    console.log(`SesionProfesionalController.getById(${id})`);
    const returnEntity = await currentService.getByIdAsync(id);
    if (returnEntity != null) {
      await AuthorizationService.assertCanReadPertenecienteResource(
        req.user.id,
        Number(returnEntity.id_perteneciente),
        PROFESIONAL_PERMISSIONS.VER_HISTORIAL,
      );
      res.status(StatusCodes.OK).json(returnEntity);
    } else {
      res.status(StatusCodes.NOT_FOUND).send(`No se encontro la sesion profesional con id: ${id}.`);
    }
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
  }
});

router.post('', async (req, res) => {
  try {
    console.log('SesionProfesionalController.create');
    const entity = new SesionProfesional(req.body);
    const context = await AuthorizationService.getUserContext(req.user.id);
    if (context?.profesional?.id !== Number(entity.id_profesional)) {
      return res.status(StatusCodes.FORBIDDEN).send('No autorizado para crear sesiones de otro profesional.');
    }
    await AuthorizationService.assertCan(req.user.id, AUTH_ACTIONS.PROFESIONAL_SESION_AGENDAR, {
      id_perteneciente: Number(entity.id_perteneciente),
    });
    const newId = await currentService.createAsync(entity);
    if (newId > 0) {
      res.status(StatusCodes.CREATED).json({
        message: `Se creo la sesion profesional con id: ${newId}`,
        id: newId,
      });
    } else {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: 'No se pudo crear la sesion profesional.',
      });
    }
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.BAD_REQUEST).send(`Error: ${error.message}`);
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const entity = new SesionProfesional(req.body);
    console.log(`SesionProfesionalController.update(${id})`);
    if (entity.id && parseInt(entity.id) !== id) {
      return res.status(StatusCodes.BAD_REQUEST)
        .send(`El id de la URL (${id}) no coincide con el id del body (${entity.id}).`);
    }
    const previous = await currentService.getByIdAsync(id);
    if (previous == null) {
      return res.status(StatusCodes.NOT_FOUND).send(`No se encontro la sesion profesional con id: ${id}.`);
    }
    const context = await AuthorizationService.getUserContext(req.user.id);
    if (context?.profesional?.id !== Number(previous.id_profesional)) {
      return res.status(StatusCodes.FORBIDDEN).send('No autorizado para modificar sesiones de otro profesional.');
    }
    await AuthorizationService.assertCan(req.user.id, AUTH_ACTIONS.PROFESIONAL_SESION_AGENDAR, {
      id_perteneciente: Number(previous.id_perteneciente),
    });
    entity.id = id;
    entity.id_profesional = previous.id_profesional;
    entity.id_perteneciente = previous.id_perteneciente;
    const rowsAffected = await currentService.updateAsync(entity);
    if (rowsAffected !== 0) {
      res.status(StatusCodes.OK).json({
        message: `Se actualizo la sesion profesional con id: ${id}`,
        rowsAffected,
      });
    } else {
      res.status(StatusCodes.NOT_FOUND).send(`No se encontro la sesion profesional con id: ${id}.`);
    }
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.BAD_REQUEST).send(`Error: ${error.message}`);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    console.log(`SesionProfesionalController.delete(${id})`);
    const previous = await currentService.getByIdAsync(id);
    if (previous == null) {
      return res.status(StatusCodes.NOT_FOUND).send(`No se encontro la sesion profesional con id: ${id}.`);
    }
    const context = await AuthorizationService.getUserContext(req.user.id);
    if (context?.profesional?.id !== Number(previous.id_profesional)) {
      return res.status(StatusCodes.FORBIDDEN).send('No autorizado para eliminar sesiones de otro profesional.');
    }
    await AuthorizationService.assertCan(req.user.id, AUTH_ACTIONS.PROFESIONAL_SESION_AGENDAR, {
      id_perteneciente: Number(previous.id_perteneciente),
    });
    const rowCount = await currentService.deleteByIdAsync(id);
    if (rowCount !== 0) {
      res.status(StatusCodes.OK).json({
        message: `Se elimino la sesion profesional con id: ${id}`,
        rowsAffected: rowCount,
      });
    } else {
      res.status(StatusCodes.NOT_FOUND).send(`No se encontro la sesion profesional con id: ${id}.`);
    }
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
  }
});

export default router;
