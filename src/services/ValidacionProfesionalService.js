import ValidacionProfesionalRepository from '../repositories/ValidacionProfesionalRepository.js';

export default class ValidacionProfesionalService {
  constructor() {
    console.log('Estoy en: ValidacionProfesionalService.constructor()');
    this.ValidacionProfesionalRepository = new ValidacionProfesionalRepository();
  }

  getAllAsync = async () => {
    console.log('ValidacionProfesionalService.getAllAsync()');
    const returnArray = await this.ValidacionProfesionalRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`ValidacionProfesionalService.getByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.ValidacionProfesionalRepository.getByIdAsync(id);
  };

  createAsync = async (entity) => {
    console.log(`ValidacionProfesionalService.createAsync(${JSON.stringify(entity)})`);
    if (!entity) throw new Error('La entidad es obligatoria.');
    return await this.ValidacionProfesionalRepository.createAsync(entity);
  };

  updateAsync = async (entity) => {
    console.log(`ValidacionProfesionalService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id es obligatorio para actualizar.');
    }
    const prev = await this.ValidacionProfesionalRepository.getByIdAsync(entity.id);
    if (prev == null) return 0;
    return await this.ValidacionProfesionalRepository.updateAsync(entity);
  };

  deleteByIdAsync = async (id) => {
    console.log(`ValidacionProfesionalService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.ValidacionProfesionalRepository.deleteByIdAsync(id);
  };
}
