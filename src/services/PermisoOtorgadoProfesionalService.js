import PermisoOtorgadoProfesionalRepository from '../repositories/PermisoOtorgadoProfesionalRepository.js';

export default class PermisoOtorgadoProfesionalService {
  constructor() {
    console.log('Estoy en: PermisoOtorgadoProfesionalService.constructor()');
    this.PermisoOtorgadoProfesionalRepository = new PermisoOtorgadoProfesionalRepository();
  }

  getAllAsync = async () => {
    console.log('PermisoOtorgadoProfesionalService.getAllAsync()');
    const returnArray = await this.PermisoOtorgadoProfesionalRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`PermisoOtorgadoProfesionalService.getByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.PermisoOtorgadoProfesionalRepository.getByIdAsync(id);
  };

  createAsync = async (entity) => {
    console.log(`PermisoOtorgadoProfesionalService.createAsync(${JSON.stringify(entity)})`);
    if (!entity) throw new Error('La entidad es obligatoria.');
    return await this.PermisoOtorgadoProfesionalRepository.createAsync(entity);
  };

  updateAsync = async (entity) => {
    console.log(`PermisoOtorgadoProfesionalService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id es obligatorio para actualizar.');
    }
    const prev = await this.PermisoOtorgadoProfesionalRepository.getByIdAsync(entity.id);
    if (prev == null) return 0;
    return await this.PermisoOtorgadoProfesionalRepository.updateAsync(entity);
  };

  deleteByIdAsync = async (id) => {
    console.log(`PermisoOtorgadoProfesionalService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.PermisoOtorgadoProfesionalRepository.deleteByIdAsync(id);
  };
}
