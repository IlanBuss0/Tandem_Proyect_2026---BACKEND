import TipoItemAvatarRepository from '../repositories/TipoItemAvatarRepository.js';
import BaseCrudService from './base/BaseCrudService.js';

export default class TipoItemAvatarService extends BaseCrudService {
  constructor() {
    super(new TipoItemAvatarRepository(), 'TipoItemAvatarRepository');
  }
}
