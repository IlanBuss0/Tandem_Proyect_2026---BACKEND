import { Router } from 'express';
import ProfesionalService from '../services/ProfesionalService.js';

const router = Router();
router.get('/', async (req, res, next) => { try { res.status(200).json({ ok: true, data: await ProfesionalService.list() }); } catch (e) { next(e); } });
router.get('/:id/pertenecientes', async (req, res, next) => { try { res.status(200).json({ ok: true, data: await ProfesionalService.listPertenecientes(Number(req.params.id)) }); } catch (e) { next(e); } });
router.get('/:id', async (req, res, next) => { try { res.status(200).json({ ok: true, data: await ProfesionalService.getById(Number(req.params.id)) }); } catch (e) { next(e); } });
router.post('/', async (req, res, next) => { try { res.status(201).json({ ok: true, data: await ProfesionalService.create(req.body) }); } catch (e) { next(e); } });
router.put('/:id', async (req, res, next) => { try { res.status(200).json({ ok: true, data: await ProfesionalService.update(Number(req.params.id), req.body) }); } catch (e) { next(e); } });
router.delete('/:id', async (req, res, next) => { try { await ProfesionalService.remove(Number(req.params.id)); res.status(204).send(); } catch (e) { next(e); } });

export default router;
