import ValidacionProfesionalRepository from '../repositories/ValidacionProfesionalRepository.js';

export default class ValidacionProfesionalService {
  constructor() {
    console.log('Estoy en: ValidacionProfesionalService.constructor()');
    this.ValidacionProfesionalRepository = new ValidacionProfesionalRepository();
  }

  getAllAsync = async () => {
    console.log('ValidacionProfesionalService.getAllAsync()');
    const returnArray = await this.ValidacionProfesionalRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`ValidacionProfesionalService.getByIdAsync(${id})`);
    const returnEntity = await this.ValidacionProfesionalRepository.getByIdAsync(id);
    return returnEntity;
  };

  createAsync = async (entity) => {
    console.log(`ValidacionProfesionalService.createAsync(${JSON.stringify(entity)})`);
    const newId = await this.ValidacionProfesionalRepository.createAsync(entity);
    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`ValidacionProfesionalService.updateAsync(${JSON.stringify(entity)})`);
    const rowsAffected = await this.ValidacionProfesionalRepository.updateAsync(entity);
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`ValidacionProfesionalService.deleteByIdAsync(${id})`);
    const rowsAffected = await this.ValidacionProfesionalRepository.deleteByIdAsync(id);
    return rowsAffected;
  };
}
