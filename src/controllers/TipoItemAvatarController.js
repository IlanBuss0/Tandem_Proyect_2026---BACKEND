import TipoItemAvatarService from '../services/TipoItemAvatarService.js';
import TipoItemAvatar from '../entities/TipoItemAvatar.js';
import BaseCrudController from './base/BaseCrudController.js';

export default new BaseCrudController(new TipoItemAvatarService(), TipoItemAvatar).router;
