import { Router } from 'express';
import healthController from '../controllers/HealthController.js';
import authController from '../controllers/AuthController.js';
import usuarioController from '../controllers/UsuarioController.js';
import pertenecienteController from '../controllers/PertenecienteController.js';
import tutorController from '../controllers/TutorController.js';
import profesionalController from '../controllers/ProfesionalController.js';
import administradorController from '../controllers/AdministradorController.js';
import actividadController from '../controllers/ActividadController.js';
import rutinaController from '../controllers/RutinaController.js';
import vinculoController from '../controllers/VinculoController.js';

const router = Router();
router.use('/health', healthController);
router.use('/auth', authController);
router.use('/usuarios', usuarioController);
router.use('/pertenecientes', pertenecienteController);
router.use('/tutores', tutorController);
router.use('/profesionales', profesionalController);
router.use('/admins', administradorController);
router.use('/actividades', actividadController);
router.use('/rutinas', rutinaController);
router.use('/vinculos', vinculoController);

export default router;
