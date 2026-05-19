import TipoUsuarioRepository from '../repositories/TipoUsuarioRepository.js';

export default class TipoUsuarioService {
  constructor() {
    console.log('Estoy en: TipoUsuarioService.constructor()');
    this.TipoUsuarioRepository = new TipoUsuarioRepository();
  }

  getAllAsync = async () => {
    console.log('TipoUsuarioService.getAllAsync()');
    const returnArray = await this.TipoUsuarioRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`TipoUsuarioService.getByIdAsync(${id})`);
    const returnEntity = await this.TipoUsuarioRepository.getByIdAsync(id);
    return returnEntity;
  };

  createAsync = async (entity) => {
    console.log(`TipoUsuarioService.createAsync(${JSON.stringify(entity)})`);
    const newId = await this.TipoUsuarioRepository.createAsync(entity);
    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`TipoUsuarioService.updateAsync(${JSON.stringify(entity)})`);
    const rowsAffected = await this.TipoUsuarioRepository.updateAsync(entity);
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`TipoUsuarioService.deleteByIdAsync(${id})`);
    const rowsAffected = await this.TipoUsuarioRepository.deleteByIdAsync(id);
    return rowsAffected;
  };
}
