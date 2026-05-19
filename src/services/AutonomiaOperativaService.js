import AutonomiaOperativaRepository from '../repositories/AutonomiaOperativaRepository.js';

export default class AutonomiaOperativaService {
  constructor() {
    console.log('Estoy en: AutonomiaOperativaService.constructor()');
    this.AutonomiaOperativaRepository = new AutonomiaOperativaRepository();
  }

  getAllAsync = async () => {
    console.log('AutonomiaOperativaService.getAllAsync()');
    const returnArray = await this.AutonomiaOperativaRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`AutonomiaOperativaService.getByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.AutonomiaOperativaRepository.getByIdAsync(id);
  };

  createAsync = async (entity) => {
    console.log(`AutonomiaOperativaService.createAsync(${JSON.stringify(entity)})`);
    if (!entity) throw new Error('La entidad es obligatoria.');
    return await this.AutonomiaOperativaRepository.createAsync(entity);
  };

  updateAsync = async (entity) => {
    console.log(`AutonomiaOperativaService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id es obligatorio para actualizar.');
    }
    const prev = await this.AutonomiaOperativaRepository.getByIdAsync(entity.id);
    if (prev == null) return 0;
    return await this.AutonomiaOperativaRepository.updateAsync(entity);
  };

  deleteByIdAsync = async (id) => {
    console.log(`AutonomiaOperativaService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.AutonomiaOperativaRepository.deleteByIdAsync(id);
  };
}
