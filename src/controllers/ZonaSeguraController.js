import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';

import ZonaSeguraService from '../services/ZonaSeguraService.js';
import ZonaSegura from '../entities/ZonaSegura.js';
import AuthorizationService from '../services/AuthorizationService.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { PROFESIONAL_PERMISSIONS } from '../modules/security/permissions.constants.js';

const router = Router();
const currentService = new ZonaSeguraService();

router.use(authMiddleware);

router.get('', async (req, res) => {
  try {
    console.log('ZonaSeguraController.getAll');
    const idPerteneciente = Number(req.query.id_perteneciente);
    if (!idPerteneciente) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: 'id_perteneciente es obligatorio para listar zonas seguras.',
      });
    }

    await AuthorizationService.assertCanReadPertenecienteResource(
      req.user.id,
      idPerteneciente,
      PROFESIONAL_PERMISSIONS.VER_UBICACION,
    );
    const returnArray = await currentService.getByPertenecienteIdAsync(idPerteneciente);
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
    console.log(`ZonaSeguraController.getById(${id})`);
    await AuthorizationService.assertCanAccessZonaSegura(req.user.id, id, 'read');
    const returnEntity = await currentService.getByIdAsync(id);
    if (returnEntity != null) {
      res.status(StatusCodes.OK).json(returnEntity);
    } else {
      res.status(StatusCodes.NOT_FOUND).send(`No se encontro la zona segura con id: ${id}.`);
    }
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
  }
});

router.post('', async (req, res) => {
  try {
    console.log('ZonaSeguraController.create');
    const entity = new ZonaSegura(req.body);
    await AuthorizationService.assertCanWritePertenecienteResource(req.user.id, Number(entity.id_perteneciente), {
      allowTutor: true,
    });
    const newId = await currentService.createAsync(entity);
    if (newId > 0) {
      res.status(StatusCodes.CREATED).json({
        message: `Se creo la zona segura con id: ${newId}`,
        id: newId,
      });
    } else {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: 'No se pudo crear la zona segura.',
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
    const entity = new ZonaSegura(req.body);
    console.log(`ZonaSeguraController.update(${id})`);
    await AuthorizationService.assertCanAccessZonaSegura(req.user.id, id, 'write');
    if (entity.id && parseInt(entity.id) !== id) {
      return res.status(StatusCodes.BAD_REQUEST)
        .send(`El id de la URL (${id}) no coincide con el id del body (${entity.id}).`);
    }
    const previous = await currentService.getByIdAsync(id);
    if (previous == null) {
      return res.status(StatusCodes.NOT_FOUND).send(`No se encontro la zona segura con id: ${id}.`);
    }
    entity.id = id;
    entity.id_perteneciente = previous.id_perteneciente;
    entity.id_tutor_creador = previous.id_tutor_creador;
    const rowsAffected = await currentService.updateAsync(entity);
    if (rowsAffected !== 0) {
      res.status(StatusCodes.OK).json({
        message: `Se actualizo la zona segura con id: ${id}`,
        rowsAffected,
      });
    } else {
      res.status(StatusCodes.NOT_FOUND).send(`No se encontro la zona segura con id: ${id}.`);
    }
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.BAD_REQUEST).send(`Error: ${error.message}`);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    console.log(`ZonaSeguraController.delete(${id})`);
    await AuthorizationService.assertCanAccessZonaSegura(req.user.id, id, 'write');
    const rowCount = await currentService.deleteByIdAsync(id);
    if (rowCount !== 0) {
      res.status(StatusCodes.OK).json({
        message: `Se desactivo la zona segura con id: ${id}`,
        rowsAffected: rowCount,
      });
    } else {
      res.status(StatusCodes.NOT_FOUND).send(`No se encontro la zona segura con id: ${id}.`);
    }
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
  }
});

export default router;
