import { Router } from 'express';
import BD from '../db/BD.js';

const router = Router();
router.get('/', (req, res) => res.status(200).json({ ok: true, message: 'API TÁNDEM funcionando' }));
router.get('/db', async (req, res, next) => {
  try {
    const data = await BD.queryOne('SELECT NOW() AS fecha_actual');
    res.status(200).json({ ok: true, data });
  } catch (error) {
    next(error);
  }
});

export default router;
