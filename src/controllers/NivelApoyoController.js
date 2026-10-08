import NivelApoyoService from '../services/NivelApoyoService.js';
import NivelApoyo from '../entities/NivelApoyo.js';
import BaseCrudController from './base/BaseCrudController.js';

export default new BaseCrudController(new NivelApoyoService(), NivelApoyo).router;
