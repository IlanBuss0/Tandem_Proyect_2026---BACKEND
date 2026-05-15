import BaseCrudService from './BaseCrudService.js';
import EventoRepository from '../repositories/EventoRepository.js';
class EventoService extends BaseCrudService {
  constructor() { super(EventoRepository, { hiddenFields: [] }); }
  listByPerteneciente(id) { return this.repository.findByPerteneciente(id); }
}
export default new EventoService();
