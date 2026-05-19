import AuditoriaEventoRepository from '../repositories/AuditoriaEventoRepository.js';

export default class AuditoriaEventoService {
  constructor() {
    console.log('Estoy en: AuditoriaEventoService.constructor()');
    this.AuditoriaEventoRepository = new AuditoriaEventoRepository();
  }

  getAllAsync = async () => {
    console.log('AuditoriaEventoService.getAllAsync()');
    const returnArray = await this.AuditoriaEventoRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`AuditoriaEventoService.getByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.AuditoriaEventoRepository.getByIdAsync(id);
  };

  createAsync = async (entity) => {
    console.log(`AuditoriaEventoService.createAsync(${JSON.stringify(entity)})`);
    if (!entity) throw new Error('La entidad es obligatoria.');
    return await this.AuditoriaEventoRepository.createAsync(entity);
  };

  updateAsync = async (entity) => {
    console.log(`AuditoriaEventoService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id es obligatorio para actualizar.');
    }
    const prev = await this.AuditoriaEventoRepository.getByIdAsync(entity.id);
    if (prev == null) return 0;
    return await this.AuditoriaEventoRepository.updateAsync(entity);
  };

  deleteByIdAsync = async (id) => {
    console.log(`AuditoriaEventoService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.AuditoriaEventoRepository.deleteByIdAsync(id);
  };
}
