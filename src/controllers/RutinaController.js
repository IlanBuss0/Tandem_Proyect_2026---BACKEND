import { Router } from 'express';
import RutinaService from '../services/RutinaService.js';

const router = Router();
router.get('/', async (req, res, next) => { try { res.status(200).json({ ok: true, data: await RutinaService.list() }); } catch (e) { next(e); } });
router.get('/:id', async (req, res, next) => { try { res.status(200).json({ ok: true, data: await RutinaService.getById(Number(req.params.id)) }); } catch (e) { next(e); } });
router.post('/', async (req, res, next) => { try { res.status(201).json({ ok: true, data: await RutinaService.create(req.body) }); } catch (e) { next(e); } });
router.put('/:id', async (req, res, next) => { try { res.status(200).json({ ok: true, data: await RutinaService.update(Number(req.params.id), req.body) }); } catch (e) { next(e); } });
router.delete('/:id', async (req, res, next) => { try { await RutinaService.remove(Number(req.params.id)); res.status(204).send(); } catch (e) { next(e); } });

export default router;
