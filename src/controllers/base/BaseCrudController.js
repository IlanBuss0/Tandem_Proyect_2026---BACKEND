import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';

export default class BaseCrudController {
  constructor(service, Entity) {
    const router = Router();

    router.get('', async (req, res) => {
      try {
        res.status(StatusCodes.OK).json(await service.getAllAsync());
      } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
      }
    });

    router.get('/:id', async (req, res) => {
      try {
        const result = await service.getByIdAsync(parseInt(req.params.id));
        if (result != null) res.status(StatusCodes.OK).json(result);
        else res.status(StatusCodes.NOT_FOUND).send('No encontrado.');
      } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
      }
    });

    router.post('', async (req, res) => {
      try {
        const newId = await service.createAsync(new Entity(req.body));
        if (newId > 0) res.status(StatusCodes.CREATED).json({ id: newId });
        else res.status(StatusCodes.BAD_REQUEST).send('No se pudo crear.');
      } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).send(`Error: ${error.message}`);
      }
    });

    router.put('/:id', async (req, res) => {
      try {
        const entity = new Entity(req.body);
        entity.id = parseInt(req.params.id);
        const rowsAffected = await service.updateAsync(entity);
        if (rowsAffected !== 0) res.status(StatusCodes.OK).json({ rowsAffected });
        else res.status(StatusCodes.NOT_FOUND).send('No encontrado.');
      } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).send(`Error: ${error.message}`);
      }
    });

    router.delete('/:id', async (req, res) => {
      try {
        const rowCount = await service.deleteByIdAsync(parseInt(req.params.id));
        if (rowCount !== 0) res.status(StatusCodes.OK).json({ rowsAffected: rowCount });
        else res.status(StatusCodes.NOT_FOUND).send('No encontrado.');
      } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
      }
    });

    this.router = router;
  }
}
