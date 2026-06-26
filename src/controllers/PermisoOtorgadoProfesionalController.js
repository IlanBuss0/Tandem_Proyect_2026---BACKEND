import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import PermisoOtorgadoProfesionalService from '../services/PermisoOtorgadoProfesionalService.js';
import PermisoOtorgadoProfesional from '../entities/PermisoOtorgadoProfesional.js';
import AuthorizationService from '../services/AuthorizationService.js';

const router = Router();
const currentService = new PermisoOtorgadoProfesionalService();

router.get('', async (req, res) => {
  try {
    const r = await currentService.getAllAsync();
    res.status(StatusCodes.OK).json(r);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const r = await currentService.getByIdAsync(id);
    if (r != null) res.status(StatusCodes.OK).json(r);
    else res.status(StatusCodes.NOT_FOUND).send('No encontrado.');
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
  }
});

router.post('', async (req, res) => {
  try {
    const entity = new PermisoOtorgadoProfesional(req.body);
    const newId = await currentService.createAsync(entity);
    if (newId > 0) {
      await AuthorizationService.invalidateProfesionalPermissions(entity.id_vinculo_profesional_perteneciente);
      res.status(StatusCodes.CREATED).json({ id: newId });
    } else res.status(StatusCodes.BAD_REQUEST).send('No se pudo crear.');
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).send(`Error: ${error.message}`);
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const entity = new PermisoOtorgadoProfesional(req.body);
    entity.id = id;
    const rowsAffected = await currentService.updateAsync(entity);
    if (rowsAffected !== 0) {
      await AuthorizationService.invalidateProfesionalPermissions(entity.id_vinculo_profesional_perteneciente);
      res.status(StatusCodes.OK).json({ rowsAffected });
    } else res.status(StatusCodes.NOT_FOUND).send('No encontrado.');
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).send(`Error: ${error.message}`);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const rowCount = await currentService.deleteByIdAsync(id);
    if (rowCount !== 0) {
      await AuthorizationService.invalidateAllForUser();
      res.status(StatusCodes.OK).json({ rowsAffected: rowCount });
    } else res.status(StatusCodes.NOT_FOUND).send('No encontrado.');
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
  }
});

export default router;
