import ResenaProfesionalRepository from '../repositories/ResenaProfesionalRepository.js';

export default class ResenaProfesionalService {
  constructor() {
    console.log('Estoy en: ResenaProfesionalService.constructor()');
    this.ResenaProfesionalRepository = new ResenaProfesionalRepository();
  }

  getAllAsync = async () => {
    console.log('ResenaProfesionalService.getAllAsync()');
    const returnArray = await this.ResenaProfesionalRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`ResenaProfesionalService.getByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.ResenaProfesionalRepository.getByIdAsync(id);
  };

  createAsync = async (entity) => {
    console.log(`ResenaProfesionalService.createAsync(${JSON.stringify(entity)})`);
    if (!entity) throw new Error('La entidad es obligatoria.');
    return await this.ResenaProfesionalRepository.createAsync(entity);
  };

  updateAsync = async (entity) => {
    console.log(`ResenaProfesionalService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id es obligatorio para actualizar.');
    }
    const prev = await this.ResenaProfesionalRepository.getByIdAsync(entity.id);
    if (prev == null) return 0;
    return await this.ResenaProfesionalRepository.updateAsync(entity);
  };

  deleteByIdAsync = async (id) => {
    console.log(`ResenaProfesionalService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.ResenaProfesionalRepository.deleteByIdAsync(id);
  };
}
