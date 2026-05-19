import EstadoActividadRepository from '../repositories/EstadoActividadRepository.js';

export default class EstadoActividadService {
  constructor() {
    console.log('Estoy en: EstadoActividadService.constructor()');
    this.EstadoActividadRepository = new EstadoActividadRepository();
  }

  getAllAsync = async () => {
    console.log('EstadoActividadService.getAllAsync()');
    const returnArray = await this.EstadoActividadRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`EstadoActividadService.getByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.EstadoActividadRepository.getByIdAsync(id);
  };

  createAsync = async (entity) => {
    console.log(`EstadoActividadService.createAsync(${JSON.stringify(entity)})`);
    if (!entity) throw new Error('La entidad es obligatoria.');
    return await this.EstadoActividadRepository.createAsync(entity);
  };

  updateAsync = async (entity) => {
    console.log(`EstadoActividadService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id es obligatorio para actualizar.');
    }
    const prev = await this.EstadoActividadRepository.getByIdAsync(entity.id);
    if (prev == null) return 0;
    return await this.EstadoActividadRepository.updateAsync(entity);
  };

  deleteByIdAsync = async (id) => {
    console.log(`EstadoActividadService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.EstadoActividadRepository.deleteByIdAsync(id);
  };
}
