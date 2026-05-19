import { Router } from 'express';
import PermisoService from '../services/PermisoService.js';

const router = Router();

router.get('/pertenecientes', async (req, res, next) => {
  try { res.status(200).json({ ok: true, data: await PermisoService.listPertenecientes() }); } catch (e) { next(e); }
});

router.get('/profesionales', async (req, res, next) => {
  try { res.status(200).json({ ok: true, data: await PermisoService.listProfesionales() }); } catch (e) { next(e); }
});

router.get('/perteneciente/:idPerteneciente', async (req, res, next) => {
  try { res.status(200).json({ ok: true, data: await PermisoService.getByPerteneciente(Number(req.params.idPerteneciente)) }); } catch (e) { next(e); }
});

router.get('/profesional/:idProfesional', async (req, res, next) => {
  try { res.status(200).json({ ok: true, data: await PermisoService.getByProfesional(Number(req.params.idProfesional)) }); } catch (e) { next(e); }
});

router.post('/perteneciente', async (req, res, next) => {
  try { res.status(201).json({ ok: true, data: await PermisoService.createPerteneciente(req.body) }); } catch (e) { next(e); }
});

router.post('/profesional', async (req, res, next) => {
  try { res.status(201).json({ ok: true, data: await PermisoService.createProfesional(req.body) }); } catch (e) { next(e); }
});

router.put('/perteneciente/:id', async (req, res, next) => {
  try { res.status(200).json({ ok: true, data: await PermisoService.updatePerteneciente(Number(req.params.id), req.body) }); } catch (e) { next(e); }
});

router.put('/profesional/:id', async (req, res, next) => {
  try { res.status(200).json({ ok: true, data: await PermisoService.updateProfesional(Number(req.params.id), req.body) }); } catch (e) { next(e); }
});

router.delete('/perteneciente/:id', async (req, res, next) => {
  try { await PermisoService.removePerteneciente(Number(req.params.id)); res.status(204).send(); } catch (e) { next(e); }
});

router.delete('/profesional/:id', async (req, res, next) => {
  try { await PermisoService.removeProfesional(Number(req.params.id)); res.status(204).send(); } catch (e) { next(e); }
});

export default router;
