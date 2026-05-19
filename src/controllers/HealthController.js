import { Router } from 'express';
import BD from '../db/BD.js';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Healthcheck funcionando',
  });
});

router.get('/db', async (req, res, next) => {
  try {
    const connection = await BD.testConnection();

    res.status(200).json({
      ok: true,
      message: 'Conexion a Supabase/PostgreSQL funcionando',
      data: connection,
    });
  } catch (error) {
    next(error);
  }
});

export default router;