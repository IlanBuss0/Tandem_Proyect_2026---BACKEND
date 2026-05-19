import EstadoValidacionProfesionalRepository from '../repositories/EstadoValidacionProfesionalRepository.js';

export default class EstadoValidacionProfesionalService {
  constructor() {
    console.log('Estoy en: EstadoValidacionProfesionalService.constructor()');
    this.EstadoValidacionProfesionalRepository = new EstadoValidacionProfesionalRepository();
  }

  getAllAsync = async () => {
    console.log('EstadoValidacionProfesionalService.getAllAsync()');
    const returnArray = await this.EstadoValidacionProfesionalRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`EstadoValidacionProfesionalService.getByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.EstadoValidacionProfesionalRepository.getByIdAsync(id);
  };

  createAsync = async (entity) => {
    console.log(`EstadoValidacionProfesionalService.createAsync(${JSON.stringify(entity)})`);
    if (!entity) throw new Error('La entidad es obligatoria.');
    return await this.EstadoValidacionProfesionalRepository.createAsync(entity);
  };

  updateAsync = async (entity) => {
    console.log(`EstadoValidacionProfesionalService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id es obligatorio para actualizar.');
    }
    const prev = await this.EstadoValidacionProfesionalRepository.getByIdAsync(entity.id);
    if (prev == null) return 0;
    return await this.EstadoValidacionProfesionalRepository.updateAsync(entity);
  };

  deleteByIdAsync = async (id) => {
    console.log(`EstadoValidacionProfesionalService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.EstadoValidacionProfesionalRepository.deleteByIdAsync(id);
  };
}
