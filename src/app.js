import express from 'express';
import cors from 'cors';

import UsuarioController from './controllers/UsuarioController.js';
import PertenecienteController from './controllers/PertenecienteController.js';
import TutorController from './controllers/TutorController.js';
import ProfesionalController from './controllers/ProfesionalController.js';
import VinculoTutorPerteneciente from './entities/VinculoTutorPerteneciente.js';
import { errorMiddleware } from './middlewares/error.middleware.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'API Backend TÁNDEM funcionando',
  });
});

app.use('/api/usuarios', UsuarioController);
app.use('/api/pertenecientes', PertenecienteController);
app.use('/api/tutores', TutorController);
app.use('/api/profesionales', ProfesionalController);
app.use('/api/vinculos-tutor-pertenecientes', VinculoTutorPertenecienteController);

app.use(errorMiddleware);

export default app;