import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import ConfiguracionAccesibilidadService from '../services/ConfiguracionAccesibilidadService.js';
import ConfiguracionAccesibilidad from '../entities/ConfiguracionAccesibilidad.js';
import AuthorizationService from '../services/AuthorizationService.js';
import { assertCanWriteUsuarioConfigAsync, getReadableUsuarioIdsAsync } from '../modules/security/usuario-config-access.js';

const router = Router();
const currentService = new ConfiguracionAccesibilidadService();

const notFoundMessage = (id) => `No se encontro la configuracion de accesibilidad con id: ${id}.`;

// Mismo criterio que configuraciones-usuarios: lectura escopeada a los
// usuarios que el que llama puede leer; escritura solo del dueño o de su tutor.
router.get('', async (req, res) => {
  try {
    console.log('ConfiguracionAccesibilidadController.getAll');
    const readableIds = await getReadableUsuarioIdsAsync(req.user.id);
    const r = await currentService.getAllAsync();
    if (r == null) return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Error interno.');
    res.status(StatusCodes.OK).json(r.filter((row) => readableIds.has(Number(row.id_usuario))));
  } catch (error) {
    console.log(error);
    res.status(error.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    console.log(`ConfiguracionAccesibilidadController.getById(${id})`);
    const r = await currentService.getByIdAsync(id);
    if (r == null) return res.status(StatusCodes.NOT_FOUND).send(notFoundMessage(id));
    await AuthorizationService.assertCanReadUsuarioConfig(req.user.id, r.id_usuario);
    res.status(StatusCodes.OK).json(r);
  } catch (error) {
    console.log(error);
    res.status(error.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
  }
});

router.post('', async (req, res) => {
  try {
    console.log('ConfiguracionAccesibilidadController.create');
    const entity = new ConfiguracionAccesibilidad(req.body);
    await assertCanWriteUsuarioConfigAsync(req.user.id, entity.id_usuario);
    const newId = await currentService.createAsync(entity);
    if (newId > 0) {
      res.status(StatusCodes.CREATED).json({ message: `Se creo la configuracion de accesibilidad con id: ${newId}`, id: newId });
    } else {
      res.status(StatusCodes.BAD_REQUEST).json({ message: 'No se pudo crear la configuracion de accesibilidad.' });
    }
  } catch (error) {
    console.log(error);
    res.status(error.statusCode ?? StatusCodes.BAD_REQUEST).send(`Error: ${error.message}`);
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const entity = new ConfiguracionAccesibilidad(req.body);
    console.log(`ConfiguracionAccesibilidadController.update(${id})`);
    if (entity.id && parseInt(entity.id) !== id) {
      return res.status(StatusCodes.BAD_REQUEST).send(`El id de la URL (${id}) no coincide con el id del body (${entity.id}).`);
    }

    const previous = await currentService.getByIdAsync(id);
    if (previous == null) return res.status(StatusCodes.NOT_FOUND).send(notFoundMessage(id));

    entity.id = id;
    entity.id_usuario = previous.id_usuario;
    await assertCanWriteUsuarioConfigAsync(req.user.id, entity.id_usuario);

    const rowsAffected = await currentService.updateAsync(entity);
    if (rowsAffected !== 0) {
      res.status(StatusCodes.OK).json({ message: `Se actualizo la configuracion de accesibilidad con id: ${id}`, rowsAffected });
    } else {
      res.status(StatusCodes.NOT_FOUND).send(notFoundMessage(id));
    }
  } catch (error) {
    console.log(error);
    res.status(error.statusCode ?? StatusCodes.BAD_REQUEST).send(`Error: ${error.message}`);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    console.log(`ConfiguracionAccesibilidadController.delete(${id})`);
    const previous = await currentService.getByIdAsync(id);
    if (previous == null) return res.status(StatusCodes.NOT_FOUND).send(notFoundMessage(id));

    await assertCanWriteUsuarioConfigAsync(req.user.id, previous.id_usuario);
    const rowCount = await currentService.deleteByIdAsync(id);
    if (rowCount !== 0) {
      res.status(StatusCodes.OK).json({ message: `Se elimino la configuracion de accesibilidad con id: ${id}`, rowsAffected: rowCount });
    } else {
      res.status(StatusCodes.NOT_FOUND).send(notFoundMessage(id));
    }
  } catch (error) {
    console.log(error);
    res.status(error.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
  }
});

export default router;
