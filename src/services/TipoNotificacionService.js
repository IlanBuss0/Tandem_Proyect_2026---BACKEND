import TipoNotificacionRepository from '../repositories/TipoNotificacionRepository.js';

export default class TipoNotificacionService {
  constructor() {
    console.log('Estoy en: TipoNotificacionService.constructor()');
    this.TipoNotificacionRepository = new TipoNotificacionRepository();
  }

  getAllAsync = async () => {
    console.log('TipoNotificacionService.getAllAsync()');
    const returnArray = await this.TipoNotificacionRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`TipoNotificacionService.getByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.TipoNotificacionRepository.getByIdAsync(id);
  };

  createAsync = async (entity) => {
    console.log(`TipoNotificacionService.createAsync(${JSON.stringify(entity)})`);
    if (!entity) throw new Error('La entidad es obligatoria.');
    return await this.TipoNotificacionRepository.createAsync(entity);
  };

  updateAsync = async (entity) => {
    console.log(`TipoNotificacionService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id es obligatorio para actualizar.');
    }
    const prev = await this.TipoNotificacionRepository.getByIdAsync(entity.id);
    if (prev == null) return 0;
    return await this.TipoNotificacionRepository.updateAsync(entity);
  };

  deleteByIdAsync = async (id) => {
    console.log(`TipoNotificacionService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.TipoNotificacionRepository.deleteByIdAsync(id);
  };
}
