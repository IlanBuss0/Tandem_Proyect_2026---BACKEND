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
    const returnEntity = await this.EstadoReporteRepository.getByIdAsync(id);
    return returnEntity;
  };

  createAsync = async (entity) => {
    console.log(`EstadoReporteService.createAsync(${JSON.stringify(entity)})`);
    const newId = await this.EstadoReporteRepository.createAsync(entity);
    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`EstadoReporteService.updateAsync(${JSON.stringify(entity)})`);
    const rowsAffected = await this.EstadoReporteRepository.updateAsync(entity);
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`EstadoReporteService.deleteByIdAsync(${id})`);
    const rowsAffected = await this.EstadoReporteRepository.deleteByIdAsync(id);
    return rowsAffected;
  };
}
