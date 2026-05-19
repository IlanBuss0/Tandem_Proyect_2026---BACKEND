import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';

import ResenaProfesionalService from '../services/ResenaProfesionalService.js';
import ResenaProfesional from '../entities/ResenaProfesional.js';

const router = Router();
const currentService = new ResenaProfesionalService();

router.get('', async (req, res) => {
  try {
    console.log('ResenaProfesionalController.getAll');

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

    console.log(`ResenaProfesionalController.getById(${id})`);

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
    console.log('ResenaProfesionalController.create');

    const entity = new ResenaProfesional(req.body);

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
    const entity = new ResenaProfesional(req.body);

    console.log(`ResenaProfesionalController.update(${id})`);

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

    console.log(`ResenaProfesionalController.delete(${id})`);

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
