import EstadoReporteRepository from '../repositories/EstadoReporteRepository.js';

export default class EstadoReporteService {
  constructor() {
    console.log('Estoy en: EstadoReporteService.constructor()');
    this.EstadoReporteRepository = new EstadoReporteRepository();
  }

  getAllAsync = async () => {
    console.log('EstadoReporteService.getAllAsync()');
    const returnArray = await this.EstadoReporteRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`EstadoReporteService.getByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.EstadoReporteRepository.getByIdAsync(id);
  };

  createAsync = async (entity) => {
    console.log(`EstadoReporteService.createAsync(${JSON.stringify(entity)})`);
    if (!entity) throw new Error('La entidad es obligatoria.');
    return await this.EstadoReporteRepository.createAsync(entity);
  };

  updateAsync = async (entity) => {
    console.log(`EstadoReporteService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id es obligatorio para actualizar.');
    }
    const prev = await this.EstadoReporteRepository.getByIdAsync(entity.id);
    if (prev == null) return 0;
    return await this.EstadoReporteRepository.updateAsync(entity);
  };

  deleteByIdAsync = async (id) => {
    console.log(`EstadoReporteService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.EstadoReporteRepository.deleteByIdAsync(id);
  };
}
