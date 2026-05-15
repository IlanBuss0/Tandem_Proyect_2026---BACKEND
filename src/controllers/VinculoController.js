import { Router } from 'express';
import VinculoService from '../services/VinculoService.js';

const router = Router();

router.get('/tutores-pertenecientes', async (req, res, next) => { try { res.status(200).json({ ok: true, data: await VinculoService.listTutorPerteneciente() }); } catch (e) { next(e); } });
router.post('/tutores-pertenecientes', async (req, res, next) => { try { res.status(201).json({ ok: true, data: await VinculoService.createTutorPerteneciente(req.body) }); } catch (e) { next(e); } });
router.delete('/tutores-pertenecientes/:id', async (req, res, next) => { try { await VinculoService.removeTutorPerteneciente(Number(req.params.id)); res.status(204).send(); } catch (e) { next(e); } });

router.get('/profesionales-pertenecientes', async (req, res, next) => { try { res.status(200).json({ ok: true, data: await VinculoService.listProfesionalPerteneciente() }); } catch (e) { next(e); } });
router.post('/profesionales-pertenecientes', async (req, res, next) => { try { res.status(201).json({ ok: true, data: await VinculoService.createProfesionalPerteneciente(req.body) }); } catch (e) { next(e); } });
router.delete('/profesionales-pertenecientes/:id', async (req, res, next) => { try { await VinculoService.removeProfesionalPerteneciente(Number(req.params.id)); res.status(204).send(); } catch (e) { next(e); } });

export default router;
