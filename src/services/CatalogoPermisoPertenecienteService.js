import CatalogoPermisoPertenecienteRepository from '../repositories/CatalogoPermisoPertenecienteRepository.js';

export default class CatalogoPermisoPertenecienteService {
  constructor() {
    console.log('Estoy en: CatalogoPermisoPertenecienteService.constructor()');
    this.CatalogoPermisoPertenecienteRepository = new CatalogoPermisoPertenecienteRepository();
  }

  getAllAsync = async () => {
    console.log('CatalogoPermisoPertenecienteService.getAllAsync()');
    const returnArray = await this.CatalogoPermisoPertenecienteRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`CatalogoPermisoPertenecienteService.getByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.CatalogoPermisoPertenecienteRepository.getByIdAsync(id);
  };

  createAsync = async (entity) => {
    console.log(`CatalogoPermisoPertenecienteService.createAsync(${JSON.stringify(entity)})`);
    if (!entity) throw new Error('La entidad es obligatoria.');
    return await this.CatalogoPermisoPertenecienteRepository.createAsync(entity);
  };

  updateAsync = async (entity) => {
    console.log(`CatalogoPermisoPertenecienteService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id es obligatorio para actualizar.');
    }
    const prev = await this.CatalogoPermisoPertenecienteRepository.getByIdAsync(entity.id);
    if (prev == null) return 0;
    return await this.CatalogoPermisoPertenecienteRepository.updateAsync(entity);
  };

  deleteByIdAsync = async (id) => {
    console.log(`CatalogoPermisoPertenecienteService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.CatalogoPermisoPertenecienteRepository.deleteByIdAsync(id);
  };
}
