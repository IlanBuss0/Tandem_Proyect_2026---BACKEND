import { Router } from 'express';
import SuscripcionService from '../services/SuscripcionService.js';

const router = Router();
router.get('/suscripciones', async (req, res, next) => { try { res.status(200).json({ ok: true, data: await SuscripcionService.list() }); } catch (e) { next(e); } });
router.get('/suscripciones/:id', async (req, res, next) => { try { res.status(200).json({ ok: true, data: await SuscripcionService.getById(Number(req.params.id)) }); } catch (e) { next(e); } });
router.post('/suscripciones', async (req, res, next) => { try { res.status(201).json({ ok: true, data: await SuscripcionService.create(req.body) }); } catch (e) { next(e); } });
router.put('/suscripciones/:id', async (req, res, next) => { try { res.status(200).json({ ok: true, data: await SuscripcionService.update(Number(req.params.id), req.body) }); } catch (e) { next(e); } });
router.delete('/suscripciones/:id', async (req, res, next) => { try { await SuscripcionService.remove(Number(req.params.id)); res.status(204).send(); } catch (e) { next(e); } });
router.get('/planes', async (req, res, next) => { try { res.status(200).json({ ok: true, data: await SuscripcionService.listPlanes() }); } catch (e) { next(e); } });
router.get('/planes/:id', async (req, res, next) => { try { res.status(200).json({ ok: true, data: await SuscripcionService.getPlanById(Number(req.params.id)) }); } catch (e) { next(e); } });

export default router;
