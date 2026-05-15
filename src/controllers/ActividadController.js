import { Router } from 'express';
import ActividadService from '../services/ActividadService.js';

const router = Router();
router.get('/', async (req, res, next) => { try { res.status(200).json({ ok: true, data: await ActividadService.list() }); } catch (e) { next(e); } });
router.get('/base', async (req, res, next) => { try { res.status(200).json({ ok: true, data: await ActividadService.listBase() }); } catch (e) { next(e); } });
router.get('/personalizadas', async (req, res, next) => { try { res.status(200).json({ ok: true, data: await ActividadService.listPersonalizadas() }); } catch (e) { next(e); } });
router.get('/perteneciente/:idPerteneciente', async (req, res, next) => { try { res.status(200).json({ ok: true, data: await ActividadService.listByPerteneciente(Number(req.params.idPerteneciente)) }); } catch (e) { next(e); } });
router.get('/categoria/:categoria', async (req, res, next) => { try { res.status(200).json({ ok: true, data: await ActividadService.listByCategoria(req.params.categoria) }); } catch (e) { next(e); } });
router.get('/tipo/:tipo', async (req, res, next) => { try { res.status(200).json({ ok: true, data: await ActividadService.listByTipo(req.params.tipo) }); } catch (e) { next(e); } });
router.get('/:id', async (req, res, next) => { try { res.status(200).json({ ok: true, data: await ActividadService.getById(Number(req.params.id)) }); } catch (e) { next(e); } });
router.post('/', async (req, res, next) => { try { res.status(201).json({ ok: true, data: await ActividadService.create(req.body) }); } catch (e) { next(e); } });
router.put('/:id', async (req, res, next) => { try { res.status(200).json({ ok: true, data: await ActividadService.update(Number(req.params.id), req.body) }); } catch (e) { next(e); } });
router.delete('/:id', async (req, res, next) => { try { await ActividadService.remove(Number(req.params.id)); res.status(204).send(); } catch (e) { next(e); } });

export default router;
