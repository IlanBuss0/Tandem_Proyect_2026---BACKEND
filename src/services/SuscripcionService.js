import BaseCrudService from './BaseCrudService.js';
import SuscripcionRepository from '../repositories/SuscripcionRepository.js';
import AppError from '../modules/errors/AppError.js';

class SuscripcionService extends BaseCrudService {
  constructor() {
    super(SuscripcionRepository, { hiddenFields: [] });
  }

  listPlanes() { return this.repository.findPlanes(); }

  async getPlanById(id) {
    const row = await this.repository.findPlanById(id);
    if (!row) throw new AppError('Plan no encontrado', 404);
    return row;
  }
}

export default new SuscripcionService();
