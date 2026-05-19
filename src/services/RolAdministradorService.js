import RolAdministradorRepository from '../repositories/RolAdministradorRepository.js';

export default class RolAdministradorService {
  constructor() {
    console.log('Estoy en: RolAdministradorService.constructor()');
    this.RolAdministradorRepository = new RolAdministradorRepository();
  }

  getAllAsync = async () => {
    console.log('RolAdministradorService.getAllAsync()');
    const returnArray = await this.RolAdministradorRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`RolAdministradorService.getByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.RolAdministradorRepository.getByIdAsync(id);
  };

  createAsync = async (entity) => {
    console.log(`RolAdministradorService.createAsync(${JSON.stringify(entity)})`);
    if (!entity) throw new Error('La entidad es obligatoria.');
    return await this.RolAdministradorRepository.createAsync(entity);
  };

  updateAsync = async (entity) => {
    console.log(`RolAdministradorService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id es obligatorio para actualizar.');
    }
    const prev = await this.RolAdministradorRepository.getByIdAsync(entity.id);
    if (prev == null) return 0;
    return await this.RolAdministradorRepository.updateAsync(entity);
  };

  deleteByIdAsync = async (id) => {
    console.log(`RolAdministradorService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.RolAdministradorRepository.deleteByIdAsync(id);
  };
}
