import EntidadAfectadaAuditoriaRepository from '../repositories/EntidadAfectadaAuditoriaRepository.js';

export default class EntidadAfectadaAuditoriaService {
  constructor() {
    console.log('Estoy en: EntidadAfectadaAuditoriaService.constructor()');
    this.EntidadAfectadaAuditoriaRepository = new EntidadAfectadaAuditoriaRepository();
  }

  getAllAsync = async () => {
    console.log('EntidadAfectadaAuditoriaService.getAllAsync()');
    const returnArray = await this.EntidadAfectadaAuditoriaRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`EntidadAfectadaAuditoriaService.getByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.EntidadAfectadaAuditoriaRepository.getByIdAsync(id);
  };

  createAsync = async (entity) => {
    console.log(`EntidadAfectadaAuditoriaService.createAsync(${JSON.stringify(entity)})`);
    if (!entity) throw new Error('La entidad es obligatoria.');
    return await this.EntidadAfectadaAuditoriaRepository.createAsync(entity);
  };

  updateAsync = async (entity) => {
    console.log(`EntidadAfectadaAuditoriaService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id es obligatorio para actualizar.');
    }
    const prev = await this.EntidadAfectadaAuditoriaRepository.getByIdAsync(entity.id);
    if (prev == null) return 0;
    return await this.EntidadAfectadaAuditoriaRepository.updateAsync(entity);
  };

  deleteByIdAsync = async (id) => {
    console.log(`EntidadAfectadaAuditoriaService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.EntidadAfectadaAuditoriaRepository.deleteByIdAsync(id);
  };
}
