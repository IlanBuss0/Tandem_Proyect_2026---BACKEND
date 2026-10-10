import AutonomiaOperativaService from '../services/AutonomiaOperativaService.js';
import AutonomiaOperativa from '../entities/AutonomiaOperativa.js';
import BaseCrudController from './base/BaseCrudController.js';

export default new BaseCrudController(new AutonomiaOperativaService(), AutonomiaOperativa).router;
