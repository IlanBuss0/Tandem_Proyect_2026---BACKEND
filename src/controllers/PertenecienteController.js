import { Router } from 'express';
import PertenecienteService from '../services/PertenecienteService.js';

const router = Router();

router.get('/', async (req, res, next) => { try { res.status(200).json({ ok: true, data: await PertenecienteService.findAll() }); } catch (e) { next(e); } });
router.get('/:id/tutores', async (req, res, next) => { try { res.status(200).json({ ok: true, data: await PertenecienteService.findTutores(Number(req.params.id)) }); } catch (e) { next(e); } });
router.get('/:id/profesionales', async (req, res, next) => { try { res.status(200).json({ ok: true, data: await PertenecienteService.findProfesionales(Number(req.params.id)) }); } catch (e) { next(e); } });
router.get('/:id/actividades', async (req, res, next) => { try { res.status(200).json({ ok: true, data: await PertenecienteService.findActividades(Number(req.params.id)) }); } catch (e) { next(e); } });
router.get('/:id/rutinas', async (req, res, next) => { try { res.status(200).json({ ok: true, data: await PertenecienteService.findRutinas(Number(req.params.id)) }); } catch (e) { next(e); } });
router.get('/:id/eventos', async (req, res, next) => { try { res.status(200).json({ ok: true, data: await PertenecienteService.findEventos(Number(req.params.id)) }); } catch (e) { next(e); } });
router.get('/:id/emociones', async (req, res, next) => { try { res.status(200).json({ ok: true, data: await PertenecienteService.findEmociones(Number(req.params.id)) }); } catch (e) { next(e); } });
router.get('/:id/objetivos', async (req, res, next) => { try { res.status(200).json({ ok: true, data: await PertenecienteService.findObjetivos(Number(req.params.id)) }); } catch (e) { next(e); } });
router.get('/:id/ubicaciones', async (req, res, next) => { try { res.status(200).json({ ok: true, data: await PertenecienteService.findUbicaciones(Number(req.params.id)) }); } catch (e) { next(e); } });
router.get('/:id/notificaciones', async (req, res, next) => { try { res.status(200).json({ ok: true, data: await PertenecienteService.findNotificaciones(Number(req.params.id)) }); } catch (e) { next(e); } });
router.get('/:id/dashboard', async (req, res, next) => { try { res.status(200).json({ ok: true, data: await PertenecienteService.getDashboard(Number(req.params.id)) }); } catch (e) { next(e); } });

router.get('/:id', async (req, res, next) => { try { res.status(200).json({ ok: true, data: await PertenecienteService.findById(Number(req.params.id)) }); } catch (e) { next(e); } });
router.get('/', async (req, res, next) => { try { res.status(200).json({ ok: true, data: await PertenecienteService.list() }); } catch (e) { next(e); } });
router.get('/:id/tutores', async (req, res, next) => { try { res.status(200).json({ ok: true, data: await PertenecienteService.listTutores(Number(req.params.id)) }); } catch (e) { next(e); } });
router.get('/:id/profesionales', async (req, res, next) => { try { res.status(200).json({ ok: true, data: await PertenecienteService.listProfesionales(Number(req.params.id)) }); } catch (e) { next(e); } });
router.get('/:id', async (req, res, next) => { try { res.status(200).json({ ok: true, data: await PertenecienteService.getById(Number(req.params.id)) }); } catch (e) { next(e); } });
router.post('/', async (req, res, next) => { try { res.status(201).json({ ok: true, data: await PertenecienteService.create(req.body) }); } catch (e) { next(e); } });
router.put('/:id', async (req, res, next) => { try { res.status(200).json({ ok: true, data: await PertenecienteService.update(Number(req.params.id), req.body) }); } catch (e) { next(e); } });
router.delete('/:id', async (req, res, next) => { try { await PertenecienteService.remove(Number(req.params.id)); res.status(200).json({ ok: true, data: true }); } catch (e) { next(e); } });

export default router;
