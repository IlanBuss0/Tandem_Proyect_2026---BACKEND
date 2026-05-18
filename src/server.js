import express from 'express';
import cors from 'cors';

import UsuarioController from './controllers/UsuarioController.js';
import PertenecienteController from './controllers/PertenecienteController.js';
import TutorController from './controllers/TutorController.js';
import ProfesionalController from './controllers/ProfesionalController.js';
import ActividadController from './controllers/ActividadController.js';
import ActividadPersonalizadaController from './controllers/ActividadPersonalizadaController.js';
import ActividadAsignadaController from './controllers/ActividadAsignadaController.js';
import FavoritoActividadController from './controllers/FavoritoActividadController.js';
import CalificacionActividadController from './controllers/CalificacionActividadController.js';
import AvatarController from './controllers/AvatarController.js';
import SaldoPuntoController from './controllers/SaldoPuntoController.js';
import MovimientoPuntoController from './controllers/MovimientoPuntoController.js';
import EvaluacionAutonomiaController from './controllers/EvaluacionAutonomiaController.js';
import ZonaSeguraController from './controllers/ZonaSeguraController.js';
import InventarioAvatarController from './controllers/InventarioAvatarController.js';
import ItemAvatarController from './controllers/ItemAvatarController.js';
import EventoZonaSeguraController from './controllers/EventoZonaSeguraController.js';
import CompraPuntoController from './controllers/CompraPuntoController.js';
import SesionProfesionalController from './controllers/SesionProfesionalController.js';
import DispositivoController from './controllers/DispositivoController.js';
import UbicacionActualController from './controllers/UbicacionActualController.js';
import UbicacionHistorialController from './controllers/UbicacionHistorialController.js';
import NotificacionController from './controllers/NotificacionController.js';
import ContactoController from './controllers/ContactoController.js';
import ChatController from './controllers/ChatController.js';
import ParticipanteChatController from './controllers/ParticipanteChatController.js';
import MensajeController from './controllers/MensajeController.js';
import BloqueoUsuarioController from './controllers/BloqueoUsuarioController.js';
import ConfiguracionUsuarioController from './controllers/ConfiguracionUsuarioController.js';
import ConfiguracionAccesibilidadController from './controllers/ConfiguracionAccesibilidadController.js';
import ReporteUsuarioController from './controllers/ReporteUsuarioController.js';
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
app.use('/api/actividades', ActividadController);
app.use('/api/actividades-personalizadas', ActividadPersonalizadaController);
app.use('/api/actividades-asignadas', ActividadAsignadaController);
app.use('/api/favoritos-actividades', FavoritoActividadController);
app.use('/api/calificaciones-actividades', CalificacionActividadController);
app.use('/api/avatares', AvatarController);
app.use('/api/saldos-puntos', SaldoPuntoController);
app.use('/api/movimientos-puntos', MovimientoPuntoController);
app.use('/api/evaluaciones-autonomias', EvaluacionAutonomiaController);
app.use('/api/zonas-seguras', ZonaSeguraController);
app.use('/api/inventarios-avatares', InventarioAvatarController);
app.use('/api/items-avatares', ItemAvatarController);
app.use('/api/eventos-zonas-seguras', EventoZonaSeguraController);
app.use('/api/compras-puntos', CompraPuntoController);
app.use('/api/sesiones-profesionales', SesionProfesionalController);
app.use('/api/dispositivos', DispositivoController);
app.use('/api/ubicaciones-actuales', UbicacionActualController);
app.use('/api/ubicaciones-historiales', UbicacionHistorialController);
app.use('/api/notificaciones', NotificacionController);
app.use('/api/contactos', ContactoController);
app.use('/api/chats', ChatController);
app.use('/api/participantes-chats', ParticipanteChatController);
app.use('/api/mensajes', MensajeController);
app.use('/api/bloqueos-usuarios', BloqueoUsuarioController);
app.use('/api/configuraciones-usuarios', ConfiguracionUsuarioController);
app.use('/api/configuraciones-accesibilidad', ConfiguracionAccesibilidadController);
app.use('/api/reportes-usuarios', ReporteUsuarioController);

app.use(errorMiddleware);

export default app;