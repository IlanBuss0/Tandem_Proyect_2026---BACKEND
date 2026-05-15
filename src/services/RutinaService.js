import BaseCrudService from './BaseCrudService.js';
import RutinaRepository from '../repositories/RutinaRepository.js';
import AppError from '../modules/errors/AppError.js';

class RutinaService extends BaseCrudService {
  constructor() {
    super(RutinaRepository, { hiddenFields: [] });
  }

  listByPerteneciente(id) { return this.repository.findByPerteneciente(id); }
  listItems(idRutina) { return this.repository.findItems(idRutina); }
  createItem(idRutina, body) { return this.repository.createItem(idRutina, body); }

  async updateItem(idItem, body) {
    const row = await this.repository.updateItem(idItem, body);
    if (!row) throw new AppError('Item no encontrado', 404);
    return row;
  }

  async removeItem(idItem) {
    const count = await this.repository.removeItem(idItem);
    if (!count) throw new AppError('Item no encontrado', 404);
  }
}

export default new RutinaService();
