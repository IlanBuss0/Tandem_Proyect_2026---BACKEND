import NivelApoyoRepository from '../repositories/NivelApoyoRepository.js';

export default class NivelApoyoService {
  constructor() {
    console.log('Estoy en: NivelApoyoService.constructor()');
    this.NivelApoyoRepository = new NivelApoyoRepository();
  }

  getAllAsync = async () => {
    console.log('NivelApoyoService.getAllAsync()');
    const returnArray = await this.NivelApoyoRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`NivelApoyoService.getByIdAsync(${id})`);
    const returnEntity = await this.NivelApoyoRepository.getByIdAsync(id);
    return returnEntity;
  };

  createAsync = async (entity) => {
    console.log(`NivelApoyoService.createAsync(${JSON.stringify(entity)})`);
    const newId = await this.NivelApoyoRepository.createAsync(entity);
    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`NivelApoyoService.updateAsync(${JSON.stringify(entity)})`);
    const rowsAffected = await this.NivelApoyoRepository.updateAsync(entity);
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`NivelApoyoService.deleteByIdAsync(${id})`);
    const rowsAffected = await this.NivelApoyoRepository.deleteByIdAsync(id);
    return rowsAffected;
  };
}
