import DificultadActividadRepository from '../repositories/DificultadActividadRepository.js';

export default class DificultadActividadService {
  constructor() {
    console.log('Estoy en: DificultadActividadService.constructor()');
    this.DificultadActividadRepository = new DificultadActividadRepository();
  }

  getAllAsync = async () => {
    console.log('DificultadActividadService.getAllAsync()');
    const returnArray = await this.DificultadActividadRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`DificultadActividadService.getByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.DificultadActividadRepository.getByIdAsync(id);
  };

  createAsync = async (entity) => {
    console.log(`DificultadActividadService.createAsync(${JSON.stringify(entity)})`);
    if (!entity) throw new Error('La entidad es obligatoria.');
    return await this.DificultadActividadRepository.createAsync(entity);
  };

  updateAsync = async (entity) => {
    console.log(`DificultadActividadService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id es obligatorio para actualizar.');
    }
    const prev = await this.DificultadActividadRepository.getByIdAsync(entity.id);
    if (prev == null) return 0;
    return await this.DificultadActividadRepository.updateAsync(entity);
  };

  deleteByIdAsync = async (id) => {
    console.log(`DificultadActividadService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.DificultadActividadRepository.deleteByIdAsync(id);
  };
}
