import CatalogoPermisoProfesionalRepository from '../repositories/CatalogoPermisoProfesionalRepository.js';

export default class CatalogoPermisoProfesionalService {
  constructor() {
    console.log('Estoy en: CatalogoPermisoProfesionalService.constructor()');
    this.CatalogoPermisoProfesionalRepository = new CatalogoPermisoProfesionalRepository();
  }

  getAllAsync = async () => {
    console.log('CatalogoPermisoProfesionalService.getAllAsync()');
    const returnArray = await this.CatalogoPermisoProfesionalRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`CatalogoPermisoProfesionalService.getByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.CatalogoPermisoProfesionalRepository.getByIdAsync(id);
  };

  createAsync = async (entity) => {
    console.log(`CatalogoPermisoProfesionalService.createAsync(${JSON.stringify(entity)})`);
    if (!entity) throw new Error('La entidad es obligatoria.');
    return await this.CatalogoPermisoProfesionalRepository.createAsync(entity);
  };

  updateAsync = async (entity) => {
    console.log(`CatalogoPermisoProfesionalService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id es obligatorio para actualizar.');
    }
    const prev = await this.CatalogoPermisoProfesionalRepository.getByIdAsync(entity.id);
    if (prev == null) return 0;
    return await this.CatalogoPermisoProfesionalRepository.updateAsync(entity);
  };

  deleteByIdAsync = async (id) => {
    console.log(`CatalogoPermisoProfesionalService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.CatalogoPermisoProfesionalRepository.deleteByIdAsync(id);
  };
}
