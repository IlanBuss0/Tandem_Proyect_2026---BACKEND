import CatalogoPermisoProfesionalRepository from '../repositories/CatalogoPermisoProfesionalRepository.js';
import BaseCrudService from './base/BaseCrudService.js';

export default class CatalogoPermisoProfesionalService extends BaseCrudService {
  constructor() {
    super(new CatalogoPermisoProfesionalRepository(), 'CatalogoPermisoProfesionalRepository');
  }
}
