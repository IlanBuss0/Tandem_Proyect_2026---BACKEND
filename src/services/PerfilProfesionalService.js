import PerfilProfesionalRepository from '../repositories/PerfilProfesionalRepository.js';

export default class PerfilProfesionalService {
  constructor() {
    console.log('Estoy en: PerfilProfesionalService.constructor()');
    this.PerfilProfesionalRepository = new PerfilProfesionalRepository();
  }

  getAllAsync = async () => {
    console.log('PerfilProfesionalService.getAllAsync()');
    const returnArray = await this.PerfilProfesionalRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`PerfilProfesionalService.getByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.PerfilProfesionalRepository.getByIdAsync(id);
  };

  createAsync = async (entity) => {
    console.log(`PerfilProfesionalService.createAsync(${JSON.stringify(entity)})`);
    if (!entity) throw new Error('La entidad es obligatoria.');
    return await this.PerfilProfesionalRepository.createAsync(entity);
  };

  updateAsync = async (entity) => {
    console.log(`PerfilProfesionalService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id es obligatorio para actualizar.');
    }
    const prev = await this.PerfilProfesionalRepository.getByIdAsync(entity.id);
    if (prev == null) return 0;
    return await this.PerfilProfesionalRepository.updateAsync(entity);
  };

  deleteByIdAsync = async (id) => {
    console.log(`PerfilProfesionalService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.PerfilProfesionalRepository.deleteByIdAsync(id);
  };
}
