import BaseCrudService from './BaseCrudService.js';
import EmocionRepository from '../repositories/EmocionRepository.js';
class EmocionService extends BaseCrudService {
  constructor() { super(EmocionRepository, { hiddenFields: [] }); }
  listByPerteneciente(id) { return this.repository.findByPerteneciente(id); }
}
export default new EmocionService();
