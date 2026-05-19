import TipoEventoAuditoriaRepository from '../repositories/TipoEventoAuditoriaRepository.js';

export default class TipoEventoAuditoriaService {
  constructor() {
    console.log('Estoy en: TipoEventoAuditoriaService.constructor()');
    this.TipoEventoAuditoriaRepository = new TipoEventoAuditoriaRepository();
  }

  getAllAsync = async () => {
    console.log('TipoEventoAuditoriaService.getAllAsync()');
    const returnArray = await this.TipoEventoAuditoriaRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`TipoEventoAuditoriaService.getByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.TipoEventoAuditoriaRepository.getByIdAsync(id);
  };

  createAsync = async (entity) => {
    console.log(`TipoEventoAuditoriaService.createAsync(${JSON.stringify(entity)})`);
    if (!entity) throw new Error('La entidad es obligatoria.');
    return await this.TipoEventoAuditoriaRepository.createAsync(entity);
  };

  updateAsync = async (entity) => {
    console.log(`TipoEventoAuditoriaService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id es obligatorio para actualizar.');
    }
    const prev = await this.TipoEventoAuditoriaRepository.getByIdAsync(entity.id);
    if (prev == null) return 0;
    return await this.TipoEventoAuditoriaRepository.updateAsync(entity);
  };

  deleteByIdAsync = async (id) => {
    console.log(`TipoEventoAuditoriaService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.TipoEventoAuditoriaRepository.deleteByIdAsync(id);
  };
}
