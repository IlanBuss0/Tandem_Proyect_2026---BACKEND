import { Router } from 'express';
import AuthService from '../services/AuthService.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();
router.post('/register', async (req, res, next) => { try { res.status(201).json({ ok: true, data: await AuthService.register(req.body) }); } catch (e) { next(e); } });
router.post('/login', async (req, res, next) => { try { res.status(200).json({ ok: true, data: await AuthService.login(req.body) }); } catch (e) { next(e); } });
router.get('/me', authMiddleware, async (req, res, next) => { try { res.status(200).json({ ok: true, data: await AuthService.me(req) }); } catch (e) { next(e); } });

export default router;
