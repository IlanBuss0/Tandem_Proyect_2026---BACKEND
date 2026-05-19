import EstadoValidacionProfesionalRepository from '../repositories/EstadoValidacionProfesionalRepository.js';

export default class EstadoValidacionProfesionalService {
  constructor() {
    console.log('Estoy en: EstadoValidacionProfesionalService.constructor()');
    this.EstadoValidacionProfesionalRepository = new EstadoValidacionProfesionalRepository();
  }

  getAllAsync = async () => {
    console.log('EstadoValidacionProfesionalService.getAllAsync()');
    const returnArray = await this.EstadoValidacionProfesionalRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`EstadoValidacionProfesionalService.getByIdAsync(${id})`);
    const returnEntity = await this.EstadoValidacionProfesionalRepository.getByIdAsync(id);
    return returnEntity;
  };

  createAsync = async (entity) => {
    console.log(`EstadoValidacionProfesionalService.createAsync(${JSON.stringify(entity)})`);
    const newId = await this.EstadoValidacionProfesionalRepository.createAsync(entity);
    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`EstadoValidacionProfesionalService.updateAsync(${JSON.stringify(entity)})`);
    const rowsAffected = await this.EstadoValidacionProfesionalRepository.updateAsync(entity);
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`EstadoValidacionProfesionalService.deleteByIdAsync(${id})`);
    const rowsAffected = await this.EstadoValidacionProfesionalRepository.deleteByIdAsync(id);
    return rowsAffected;
  };
}
