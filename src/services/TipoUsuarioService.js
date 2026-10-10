import TipoUsuarioRepository from '../repositories/TipoUsuarioRepository.js';
import BaseCrudService from './base/BaseCrudService.js';

export default class TipoUsuarioService extends BaseCrudService {
  constructor() {
    super(new TipoUsuarioRepository(), 'TipoUsuarioRepository');
  }
}
