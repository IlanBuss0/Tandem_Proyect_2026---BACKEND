import BaseCrudService from './BaseCrudService.js';
import ObjetivoRepository from '../repositories/ObjetivoRepository.js';
class ObjetivoService extends BaseCrudService {
  constructor() { super(ObjetivoRepository, { hiddenFields: [] }); }
  listByPerteneciente(id) { return this.repository.findByPerteneciente(id); }
}
export default new ObjetivoService();
