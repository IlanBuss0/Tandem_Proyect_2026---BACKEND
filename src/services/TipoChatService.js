import TipoChatRepository from '../repositories/TipoChatRepository.js';
import BaseCrudService from './base/BaseCrudService.js';

export default class TipoChatService extends BaseCrudService {
  constructor() {
    super(new TipoChatRepository(), 'TipoChatRepository');
  }
}
