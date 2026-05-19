import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';

import TipoMensajeService from '../services/TipoMensajeService.js';
import TipoMensaje from '../entities/TipoMensaje.js';

const router = Router();
const currentService = new TipoMensajeService();

router.get('', async (req, res) => {
  try {
    console.log('TipoMensajeController.getAll');

    const returnArray = await currentService.getAllAsync();

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

    console.log(`TipoMensajeController.getById(${id})`);

    const returnEntity = await currentService.getByIdAsync(id);

    if (returnEntity != null) {
      res.status(StatusCodes.OK).json(returnEntity);
    } else {
      res.status(StatusCodes.NOT_FOUND).send(`No se encontró el registro con id: ${id}.`);
    }
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
  }
});

router.post('', async (req, res) => {
  try {
    console.log('TipoMensajeController.create');

    const entity = new TipoMensaje(req.body);

    const newId = await currentService.createAsync(entity);

    if (newId > 0) {
      res.status(StatusCodes.CREATED).json({
        message: `Se creó el registro con id: ${newId}`,
        id: newId,
      });
    } else {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: 'No se pudo crear el registro.',
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
    const entity = new TipoMensaje(req.body);

    console.log(`TipoMensajeController.update(${id})`);

    if (entity.id && parseInt(entity.id) !== id) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send(`El id de la URL (${id}) no coincide con el id del body (${entity.id}).`);
    }

    entity.id = id;

    const rowsAffected = await currentService.updateAsync(entity);

    if (rowsAffected !== 0) {
      res.status(StatusCodes.OK).json({
        message: `Se actualizó el registro con id: ${id}`,
        rowsAffected,
      });
    } else {
      res.status(StatusCodes.NOT_FOUND).send(`No se encontró el registro con id: ${id}.`);
    }
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.BAD_REQUEST).send(`Error: ${error.message}`);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    console.log(`TipoMensajeController.delete(${id})`);

    const rowCount = await currentService.deleteByIdAsync(id);

    if (rowCount !== 0) {
      res.status(StatusCodes.OK).json({
        message: `Se eliminó el registro con id: ${id}`,
        rowsAffected: rowCount,
      });
    } else {
      res.status(StatusCodes.NOT_FOUND).send(`No se encontró el registro con id: ${id}.`);
    }
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
  }
});

export default router;
