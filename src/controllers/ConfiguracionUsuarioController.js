import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import ConfiguracionUsuarioService from '../services/ConfiguracionUsuarioService.js';
import ConfiguracionUsuario from '../entities/ConfiguracionUsuario.js';
import AuthorizationService from '../services/AuthorizationService.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { PERTENECIENTE_PERMISSIONS } from '../modules/security/permissions.constants.js';

const router = Router();
const currentService = new ConfiguracionUsuarioService();

function permissionForConfigKey(key = '') {
  if (key === 'routines.mi-dia') return PERTENECIENTE_PERMISSIONS.USAR_MI_DIA;
  if (key === 'calendar.events' || key.startsWith('calendar.event:')) return PERTENECIENTE_PERMISSIONS.USAR_CALENDARIO;
  if (key.startsWith('emotion:')) return PERTENECIENTE_PERMISSIONS.REGISTRAR_EMOCIONES;
  return null;
}

async function assertCanWriteConfig(req, entity) {
  const permission = permissionForConfigKey(String(entity?.clave || ''));
  if (!permission) return;

  const key = String(entity?.clave || '');
  const idUsuarioTarget = Number(entity.id_usuario);
  if (
    idUsuarioTarget === Number(req.user.id)
    && (key === 'calendar.events' || key.startsWith('calendar.event:'))
  ) {
    const userContext = await AuthorizationService.getUserContext(req.user.id);
    if (userContext && !userContext.perteneciente) return;
  }

  await AuthorizationService.assertCanUsePertenecienteFeatureByUsuarioId(
    req.user.id,
    idUsuarioTarget,
    permission,
  );
}

router.get('', async (req, res) => {
  try {
    console.log('ConfiguracionUsuarioController.getAll');
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

router.get('/usuario/:idUsuario', async (req, res) => {
  try {
    const idUsuario = parseInt(req.params.idUsuario);
    console.log(`ConfiguracionUsuarioController.getByUsuario(${idUsuario})`);
    const r = await currentService.getByUsuarioIdAsync(idUsuario);
    res.status(StatusCodes.OK).json(r ?? []);
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
  }
});

router.get('/usuario/:idUsuario/:clave', async (req, res) => {
  try {
    const idUsuario = parseInt(req.params.idUsuario);
    const clave = decodeURIComponent(req.params.clave);
    console.log(`ConfiguracionUsuarioController.getByUsuarioAndClave(${idUsuario}, ${clave})`);
    const r = await currentService.getByUsuarioAndClaveAsync(idUsuario, clave);
    if (r != null) {
      res.status(StatusCodes.OK).json(r);
    } else {
      res.status(StatusCodes.NOT_FOUND).send(`No se encontro la configuracion '${clave}' para el usuario ${idUsuario}.`);
    }
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    console.log(`ConfiguracionUsuarioController.getById(${id})`);
    const r = await currentService.getByIdAsync(id);
    if (r != null) {
      res.status(StatusCodes.OK).json(r);
    } else {
      res.status(StatusCodes.NOT_FOUND).send(`No se encontro la configuracion con id: ${id}.`);
    }
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
  }
});

router.post('', authMiddleware, async (req, res) => {
  try {
    console.log('ConfiguracionUsuarioController.create');
    const entity = new ConfiguracionUsuario(req.body);
    await assertCanWriteConfig(req, entity);
    const newId = await currentService.createAsync(entity);
    if (newId > 0) {
      res.status(StatusCodes.CREATED).json({ message: `Se creo la configuracion con id: ${newId}`, id: newId });
    } else {
      res.status(StatusCodes.BAD_REQUEST).json({ message: 'No se pudo crear la configuracion.' });
    }
  } catch (error) {
    console.log(error);
    res.status(error.statusCode ?? StatusCodes.BAD_REQUEST).send(`Error: ${error.message}`);
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const entity = new ConfiguracionUsuario(req.body);
    console.log(`ConfiguracionUsuarioController.update(${id})`);
    if (entity.id && parseInt(entity.id) !== id) {
      return res.status(StatusCodes.BAD_REQUEST).send(`El id de la URL (${id}) no coincide con el id del body (${entity.id}).`);
    }

    const previous = await currentService.getByIdAsync(id);
    if (previous == null) {
      return res.status(StatusCodes.NOT_FOUND).send(`No se encontro la configuracion con id: ${id}.`);
    }

    entity.id = id;
    entity.id_usuario = previous.id_usuario;
    entity.clave = previous.clave;
    await assertCanWriteConfig(req, entity);

    const rowsAffected = await currentService.updateAsync(entity);
    if (rowsAffected !== 0) {
      res.status(StatusCodes.OK).json({ message: `Se actualizo la configuracion con id: ${id}`, rowsAffected });
    } else {
      res.status(StatusCodes.NOT_FOUND).send(`No se encontro la configuracion con id: ${id}.`);
    }
  } catch (error) {
    console.log(error);
    res.status(error.statusCode ?? StatusCodes.BAD_REQUEST).send(`Error: ${error.message}`);
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    console.log(`ConfiguracionUsuarioController.delete(${id})`);
    const previous = await currentService.getByIdAsync(id);
    if (previous == null) {
      return res.status(StatusCodes.NOT_FOUND).send(`No se encontro la configuracion con id: ${id}.`);
    }

    await assertCanWriteConfig(req, previous);
    const rowCount = await currentService.deleteByIdAsync(id);
    if (rowCount !== 0) {
      res.status(StatusCodes.OK).json({ message: `Se elimino la configuracion con id: ${id}`, rowsAffected: rowCount });
    } else {
      res.status(StatusCodes.NOT_FOUND).send(`No se encontro la configuracion con id: ${id}.`);
    }
  } catch (error) {
    console.log(error);
    res.status(error.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR).send(`Error: ${error.message}`);
  }
});

export default router;
