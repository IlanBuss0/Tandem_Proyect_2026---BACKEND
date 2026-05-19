import TipoActividadRepository from '../repositories/TipoActividadRepository.js';

export default class TipoActividadService {
  constructor() {
    console.log('Estoy en: TipoActividadService.constructor()');
    this.TipoActividadRepository = new TipoActividadRepository();
  }

  getAllAsync = async () => {
    console.log('TipoActividadService.getAllAsync()');
    const returnArray = await this.TipoActividadRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`TipoActividadService.getByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.TipoActividadRepository.getByIdAsync(id);
  };

  createAsync = async (entity) => {
    console.log(`TipoActividadService.createAsync(${JSON.stringify(entity)})`);
    if (!entity) throw new Error('La entidad es obligatoria.');
    return await this.TipoActividadRepository.createAsync(entity);
  };

  updateAsync = async (entity) => {
    console.log(`TipoActividadService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id es obligatorio para actualizar.');
    }
    const prev = await this.TipoActividadRepository.getByIdAsync(entity.id);
    if (prev == null) return 0;
    return await this.TipoActividadRepository.updateAsync(entity);
  };

  deleteByIdAsync = async (id) => {
    console.log(`TipoActividadService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.TipoActividadRepository.deleteByIdAsync(id);
  };
}
