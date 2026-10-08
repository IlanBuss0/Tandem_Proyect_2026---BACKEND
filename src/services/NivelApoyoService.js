import NivelApoyoRepository from '../repositories/NivelApoyoRepository.js';
import BaseCrudService from './base/BaseCrudService.js';

export default class NivelApoyoService extends BaseCrudService {
  constructor() {
    super(new NivelApoyoRepository(), 'NivelApoyoRepository');
  }
}
