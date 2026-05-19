import TipoMensajeRepository from '../repositories/TipoMensajeRepository.js';

export default class TipoMensajeService {
  constructor() {
    console.log('Estoy en: TipoMensajeService.constructor()');
    this.TipoMensajeRepository = new TipoMensajeRepository();
  }

  getAllAsync = async () => {
    console.log('TipoMensajeService.getAllAsync()');
    const returnArray = await this.TipoMensajeRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`TipoMensajeService.getByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.TipoMensajeRepository.getByIdAsync(id);
  };

  createAsync = async (entity) => {
    console.log(`TipoMensajeService.createAsync(${JSON.stringify(entity)})`);
    if (!entity) throw new Error('La entidad es obligatoria.');
    return await this.TipoMensajeRepository.createAsync(entity);
  };

  updateAsync = async (entity) => {
    console.log(`TipoMensajeService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id es obligatorio para actualizar.');
    }
    const prev = await this.TipoMensajeRepository.getByIdAsync(entity.id);
    if (prev == null) return 0;
    return await this.TipoMensajeRepository.updateAsync(entity);
  };

  deleteByIdAsync = async (id) => {
    console.log(`TipoMensajeService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.TipoMensajeRepository.deleteByIdAsync(id);
  };
}
