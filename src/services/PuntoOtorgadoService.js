import PuntoOtorgadoRepository from '../repositories/PuntoOtorgadoRepository.js';

export default class PuntoOtorgadoService {
  constructor() {
    console.log('Estoy en: PuntoOtorgadoService.constructor()');
    this.PuntoOtorgadoRepository = new PuntoOtorgadoRepository();
  }

  getAllAsync = async () => {
    console.log('PuntoOtorgadoService.getAllAsync()');
    const returnArray = await this.PuntoOtorgadoRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`PuntoOtorgadoService.getByIdAsync(${id})`);
    const returnEntity = await this.PuntoOtorgadoRepository.getByIdAsync(id);
    return returnEntity;
  };

  createAsync = async (entity) => {
    console.log(`PuntoOtorgadoService.createAsync(${JSON.stringify(entity)})`);
    const newId = await this.PuntoOtorgadoRepository.createAsync(entity);
    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`PuntoOtorgadoService.updateAsync(${JSON.stringify(entity)})`);
    const rowsAffected = await this.PuntoOtorgadoRepository.updateAsync(entity);
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`PuntoOtorgadoService.deleteByIdAsync(${id})`);
    const rowsAffected = await this.PuntoOtorgadoRepository.deleteByIdAsync(id);
    return rowsAffected;
  };
}
