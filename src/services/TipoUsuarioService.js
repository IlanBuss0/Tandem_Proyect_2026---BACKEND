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
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.TipoUsuarioRepository.getByIdAsync(id);
  };

  createAsync = async (entity) => {
    console.log(`TipoUsuarioService.createAsync(${JSON.stringify(entity)})`);
    if (!entity) throw new Error('La entidad es obligatoria.');
    return await this.TipoUsuarioRepository.createAsync(entity);
  };

  updateAsync = async (entity) => {
    console.log(`TipoUsuarioService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id es obligatorio para actualizar.');
    }
    const prev = await this.TipoUsuarioRepository.getByIdAsync(entity.id);
    if (prev == null) return 0;
    return await this.TipoUsuarioRepository.updateAsync(entity);
  };

  deleteByIdAsync = async (id) => {
    console.log(`TipoUsuarioService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.TipoUsuarioRepository.deleteByIdAsync(id);
  };
}
