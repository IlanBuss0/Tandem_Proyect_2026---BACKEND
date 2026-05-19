import TipoPermisoArchivoRepository from '../repositories/TipoPermisoArchivoRepository.js';

export default class TipoPermisoArchivoService {
  constructor() {
    console.log('Estoy en: TipoPermisoArchivoService.constructor()');
    this.TipoPermisoArchivoRepository = new TipoPermisoArchivoRepository();
  }

  getAllAsync = async () => {
    console.log('TipoPermisoArchivoService.getAllAsync()');
    const returnArray = await this.TipoPermisoArchivoRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`TipoPermisoArchivoService.getByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.TipoPermisoArchivoRepository.getByIdAsync(id);
  };

  createAsync = async (entity) => {
    console.log(`TipoPermisoArchivoService.createAsync(${JSON.stringify(entity)})`);
    if (!entity) throw new Error('La entidad es obligatoria.');
    return await this.TipoPermisoArchivoRepository.createAsync(entity);
  };

  updateAsync = async (entity) => {
    console.log(`TipoPermisoArchivoService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id es obligatorio para actualizar.');
    }
    const prev = await this.TipoPermisoArchivoRepository.getByIdAsync(entity.id);
    if (prev == null) return 0;
    return await this.TipoPermisoArchivoRepository.updateAsync(entity);
  };

  deleteByIdAsync = async (id) => {
    console.log(`TipoPermisoArchivoService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.TipoPermisoArchivoRepository.deleteByIdAsync(id);
  };
}
