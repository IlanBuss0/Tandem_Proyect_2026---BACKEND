import BaseCrudService from './BaseCrudService.js';
import UbicacionRepository from '../repositories/UbicacionRepository.js';
import AppError from '../modules/errors/AppError.js';
class UbicacionService extends BaseCrudService {
  constructor() { super(UbicacionRepository, { hiddenFields: [] }); }
  listByPerteneciente(id) { return this.repository.findByPerteneciente(id); }
  listZonasByPerteneciente(id) { return this.repository.findZonasByPerteneciente(id); }
  createZona(body) { return this.repository.createZona(body); }
  async updateZona(id, body) { const r = await this.repository.updateZona(id, body); if (!r) throw new AppError('Zona no encontrada',404); return r; }
  async removeZona(id) { const c= await this.repository.removeZona(id); if(!c) throw new AppError('Zona no encontrada',404); }
}
export default new UbicacionService();
