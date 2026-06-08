import { Router } from 'express';
import PermisoService from '../services/PermisoService.js';
import AuthorizationService from '../services/AuthorizationService.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { AUTH_ACTIONS } from '../modules/security/permissions.constants.js';

const router = Router();

router.use(authMiddleware);

router.get('/efectivos/perteneciente/:idPerteneciente', async (req, res, next) => {
  try {
    const idPerteneciente = Number(req.params.idPerteneciente);
    await AuthorizationService.assertCanReadPertenecientePermissions(req.user.id, idPerteneciente);
    const data = await AuthorizationService.getEffectivePertenecientePermissions(idPerteneciente);
    res.status(200).json({ ok: true, data });
  } catch (e) {
    next(e);
  }
});

router.get('/efectivos/profesional-vinculo/:idVinculo', async (req, res, next) => {
  try {
    const idVinculo = Number(req.params.idVinculo);
    await AuthorizationService.assertCanReadProfesionalPermissions(req.user.id, idVinculo);
    const data = await AuthorizationService.getEffectiveProfesionalPermissions(idVinculo);
    res.status(200).json({ ok: true, data });
  } catch (e) {
    next(e);
  }
});

router.get('/can', async (req, res, next) => {
  try {
    const action = String(req.query.action || '');
    const context = {
      id_perteneciente: req.query.id_perteneciente ? Number(req.query.id_perteneciente) : undefined,
      id_profesional: req.query.id_profesional ? Number(req.query.id_profesional) : undefined,
      id_vinculo_profesional_perteneciente: req.query.id_vinculo_profesional_perteneciente
        ? Number(req.query.id_vinculo_profesional_perteneciente)
        : undefined,
    };
    const data = await AuthorizationService.can(req.user.id, action, context);
    res.status(200).json({ ok: true, data });
  } catch (e) {
    next(e);
  }
});

router.get('/pertenecientes', async (req, res, next) => {
  try { res.status(403).json({ ok: false, error: 'No autorizado para listar todos los permisos de pertenecientes' }); } catch (e) { next(e); }
});

router.get('/profesionales', async (req, res, next) => {
  try { res.status(403).json({ ok: false, error: 'No autorizado para listar todos los permisos de profesionales' }); } catch (e) { next(e); }
});

router.get('/perteneciente/:idPerteneciente', async (req, res, next) => {
  try {
    const idPerteneciente = Number(req.params.idPerteneciente);
    await AuthorizationService.assertCanReadPertenecientePermissions(req.user.id, idPerteneciente);
    res.status(200).json({ ok: true, data: await PermisoService.getByPerteneciente(idPerteneciente) });
  } catch (e) { next(e); }
});

router.get('/profesional/:idProfesional', async (req, res, next) => {
  try {
    const idProfesional = Number(req.params.idProfesional);
    const context = await AuthorizationService.getUserContext(req.user.id);
    if (context?.profesional?.id !== idProfesional) {
      return res.status(403).json({ ok: false, error: 'No autorizado para consultar permisos de otro profesional' });
    }
    res.status(200).json({ ok: true, data: await PermisoService.getByProfesional(idProfesional) });
  } catch (e) { next(e); }
});

router.post('/perteneciente', async (req, res, next) => {
  try {
    await AuthorizationService.assertCan(req.user.id, AUTH_ACTIONS.TUTOR_PERMISOS_MODIFICAR, {
      id_perteneciente: Number(req.body?.id_perteneciente),
    });
    res.status(201).json({ ok: true, data: await PermisoService.createPerteneciente({
      ...req.body,
      id_usuario_modificador: req.user.id,
      fecha_modificacion: req.body?.fecha_modificacion ?? new Date(),
    }) });
  } catch (e) { next(e); }
});

router.post('/profesional', async (req, res, next) => {
  try {
    await AuthorizationService.assertCanModifyProfesionalPermissions(
      req.user.id,
      Number(req.body?.id_vinculo_profesional_perteneciente),
    );
    res.status(201).json({ ok: true, data: await PermisoService.createProfesional({
      ...req.body,
      id_usuario_modificador: req.user.id,
      fecha_modificacion: req.body?.fecha_modificacion ?? new Date(),
    }) });
  } catch (e) { next(e); }
});

router.put('/perteneciente/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const current = await PermisoService.getPertenecientePermissionById(id);
    const idPerteneciente = Number(req.body?.id_perteneciente ?? current?.id_perteneciente);
    await AuthorizationService.assertCan(req.user.id, AUTH_ACTIONS.TUTOR_PERMISOS_MODIFICAR, { id_perteneciente: idPerteneciente });
    res.status(200).json({ ok: true, data: await PermisoService.updatePerteneciente(id, {
      ...req.body,
      id_usuario_modificador: req.user.id,
      fecha_modificacion: req.body?.fecha_modificacion ?? new Date(),
    }) });
  } catch (e) { next(e); }
});

router.put('/profesional/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const current = await PermisoService.getProfesionalPermissionById(id);
    const idVinculo = Number(req.body?.id_vinculo_profesional_perteneciente ?? current?.id_vinculo_profesional_perteneciente);
    await AuthorizationService.assertCanModifyProfesionalPermissions(req.user.id, idVinculo);
    res.status(200).json({ ok: true, data: await PermisoService.updateProfesional(id, {
      ...req.body,
      id_usuario_modificador: req.user.id,
      fecha_modificacion: req.body?.fecha_modificacion ?? new Date(),
    }) });
  } catch (e) { next(e); }
});

router.delete('/perteneciente/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const current = await PermisoService.getPertenecientePermissionById(id);
    await AuthorizationService.assertCan(req.user.id, AUTH_ACTIONS.TUTOR_PERMISOS_MODIFICAR, {
      id_perteneciente: Number(current?.id_perteneciente),
    });
    await PermisoService.removePerteneciente(id);
    res.status(204).send();
  } catch (e) { next(e); }
});

router.delete('/profesional/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const current = await PermisoService.getProfesionalPermissionById(id);
    await AuthorizationService.assertCanModifyProfesionalPermissions(
      req.user.id,
      Number(current?.id_vinculo_profesional_perteneciente),
    );
    await PermisoService.removeProfesional(id);
    res.status(204).send();
  } catch (e) { next(e); }
});

export default router;
