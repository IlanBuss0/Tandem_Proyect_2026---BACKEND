import TipoChatService from '../services/TipoChatService.js';
import TipoChat from '../entities/TipoChat.js';
import BaseCrudController from './base/BaseCrudController.js';

export default new BaseCrudController(new TipoChatService(), TipoChat).router;
