import express from 'express';
import cors from 'cors';
import BD from './db/BD.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    ok: true,
    message: 'API Backend TÁNDEM funcionando',
  });
});

app.get('/test/select', async (req, res) => {
  try {
    const resultado = await BD.query('SELECT NOW() AS fecha_actual');

    res.json({
      ok: true,
      data: resultado,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
});

export default app;