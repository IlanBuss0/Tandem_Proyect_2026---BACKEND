import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import UbicacionHistorialService from '../services/UbicacionHistorialService.js';
import UbicacionHistorial from '../entities/UbicacionHistorial.js';
import AuthorizationService from '../services/AuthorizationService.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();
const currentService = new UbicacionHistorialService();

router.use(authMiddleware);

function sendError(res, error, fallbackStatus = StatusCodes.INTERNAL_SERVER_ERROR) {
  console.log(error);
  res.status(error.statusCode ?? fallbackStatus).send(`Error: ${error.message}`);
}

router.get('', async (req, res) => {
  try {
    const idDispositivo = Number(req.query.id_dispositivo);
    if (!idDispositivo) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: 'id_dispositivo es obligatorio para consultar historial de ubicacion.',
      });
    }

    await AuthorizationService.assertCanAccessDispositivoLocation(req.user.id, idDispositivo, 'read');
    const r = await currentService.getByDispositivoIdAsync(idDispositivo);
    res.status(StatusCodes.OK).json(r);
  } catch (error) {
    sendError(res, error);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await AuthorizationService.assertCanAccessUbicacionHistorial(req.user.id, id, 'read');
    const r = await currentService.getByIdAsync(id);
    if (r != null) {
      res.status(StatusCodes.OK).json(r);
    } else {
      res.status(StatusCodes.NOT_FOUND).send(`No se encontro el historial de ubicacion con id: ${id}.`);
    }
  } catch (error) {
    sendError(res, error);
  }
});

router.post('', async (req, res) => {
  try {
    const entity = new UbicacionHistorial(req.body);
    await AuthorizationService.assertCanAccessDispositivoLocation(req.user.id, Number(entity.id_dispositivo), 'write');
    const newId = await currentService.createAsync(entity);
    if (newId > 0) {
      res.status(StatusCodes.CREATED).json({ message: `Se creo el historial de ubicacion con id: ${newId}`, id: newId });
    } else {
      res.status(StatusCodes.BAD_REQUEST).json({ message: 'No se pudo crear el historial de ubicacion.' });
    }
  } catch (error) {
    sendError(res, error, StatusCodes.BAD_REQUEST);
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await AuthorizationService.assertCanAccessUbicacionHistorial(req.user.id, id, 'write');
    const entity = new UbicacionHistorial(req.body);
    if (entity.id && parseInt(entity.id) !== id) {
      return res.status(StatusCodes.BAD_REQUEST).send(`El id de la URL (${id}) no coincide con el id del body (${entity.id}).`);
    }
    const previous = await currentService.getByIdAsync(id);
    if (previous == null) {
      return res.status(StatusCodes.NOT_FOUND).send(`No se encontro el historial de ubicacion con id: ${id}.`);
    }
    entity.id = id;
    entity.id_dispositivo = previous.id_dispositivo;
    const rowsAffected = await currentService.updateAsync(entity);
    if (rowsAffected !== 0) {
      res.status(StatusCodes.OK).json({ message: `Se actualizo el historial de ubicacion con id: ${id}`, rowsAffected });
    } else {
      res.status(StatusCodes.NOT_FOUND).send(`No se encontro el historial de ubicacion con id: ${id}.`);
    }
  } catch (error) {
    sendError(res, error, StatusCodes.BAD_REQUEST);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await AuthorizationService.assertCanAccessUbicacionHistorial(req.user.id, id, 'write');
    const rowCount = await currentService.deleteByIdAsync(id);
    if (rowCount !== 0) {
      res.status(StatusCodes.OK).json({ message: `Se elimino el historial de ubicacion con id: ${id}`, rowsAffected: rowCount });
    } else {
      res.status(StatusCodes.NOT_FOUND).send(`No se encontro el historial de ubicacion con id: ${id}.`);
    }
  } catch (error) {
    sendError(res, error);
  }
});

export default router;
