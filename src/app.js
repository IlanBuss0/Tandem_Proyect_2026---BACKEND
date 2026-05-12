import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { errorMiddleware } from './middlewares/error.middleware.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({ ok: true, message: 'API Backend TÁNDEM funcionando' });
});

app.use('/api', routes);
app.use(errorMiddleware);

export default app;
