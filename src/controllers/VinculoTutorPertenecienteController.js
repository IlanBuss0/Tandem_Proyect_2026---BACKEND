import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';

import VinculoTutorPertenecienteService from '../services/VinculoTutorPertenecienteService.js';
import VinculoTutorPerteneciente from '../entities/VinculoTutorPerteneciente.js';

const router = Router();
const currentService = new VinculoTutorPertenecienteService();

router.get('', async (req, res) => {
  try {
    console.log('VinculoTutorPertenecienteController.getAll');

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

    console.log(`VinculoTutorPertenecienteController.getById(${id})`);

    const returnEntity = await currentService.getByIdAsync(id);

    if (returnEntity != null) {
      res.status(StatusCodes.OK).json(returnEntity);
    } else {
      res.status(StatusCodes.NOT_FOUND).send(`No se encontró el vínculo con id: ${id}.`);
    }
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
  }
});

router.get('/perteneciente/:idPerteneciente', async (req, res) => {
  try {
    const idPerteneciente = parseInt(req.params.idPerteneciente);

    console.log(`VinculoTutorPertenecienteController.getByPertenecienteId(${idPerteneciente})`);

    const returnArray = await currentService.getByPertenecienteIdAsync(idPerteneciente);

    res.status(StatusCodes.OK).json(returnArray);
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
  }
});

router.get('/tutor/:idTutor', async (req, res) => {
  try {
    const idTutor = parseInt(req.params.idTutor);

    console.log(`VinculoTutorPertenecienteController.getByTutorId(${idTutor})`);

    const returnArray = await currentService.getByTutorIdAsync(idTutor);

    res.status(StatusCodes.OK).json(returnArray);
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
  }
});

router.post('', async (req, res) => {
  try {
    console.log('VinculoTutorPertenecienteController.create');

    const entity = new VinculoTutorPerteneciente(req.body);

    const newId = await currentService.createAsync(entity);

    if (newId > 0) {
      res.status(StatusCodes.CREATED).json({
        message: `Se creó el vínculo tutor-perteneciente con id: ${newId}`,
        id: newId,
      });
    } else {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: 'No se pudo crear el vínculo tutor-perteneciente.',
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
    const entity = new VinculoTutorPerteneciente(req.body);

    console.log(`VinculoTutorPertenecienteController.update(${id})`);

    if (entity.id && parseInt(entity.id) !== id) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send(`El id de la URL (${id}) no coincide con el id del body (${entity.id}).`);
    }

    entity.id = id;

    const rowsAffected = await currentService.updateAsync(entity);

    if (rowsAffected !== 0) {
      res.status(StatusCodes.OK).json({
        message: `Se actualizó el vínculo con id: ${id}`,
        rowsAffected,
      });
    } else {
      res.status(StatusCodes.NOT_FOUND).send(`No se encontró el vínculo con id: ${id}.`);
    }
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.BAD_REQUEST).send(`Error: ${error.message}`);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    console.log(`VinculoTutorPertenecienteController.delete(${id})`);

    const rowCount = await currentService.deleteByIdAsync(id);

    if (rowCount !== 0) {
      res.status(StatusCodes.OK).json({
        message: `Se finalizó el vínculo con id: ${id}`,
        rowsAffected: rowCount,
      });
    } else {
      res.status(StatusCodes.NOT_FOUND).send(`No se encontró el vínculo con id: ${id}.`);
    }
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
  }
});

export default router;