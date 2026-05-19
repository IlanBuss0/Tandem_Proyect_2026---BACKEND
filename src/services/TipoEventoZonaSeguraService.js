import TipoEventoZonaSeguraRepository from '../repositories/TipoEventoZonaSeguraRepository.js';

export default class TipoEventoZonaSeguraService {
  constructor() {
    console.log('Estoy en: TipoEventoZonaSeguraService.constructor()');
    this.TipoEventoZonaSeguraRepository = new TipoEventoZonaSeguraRepository();
  }

  getAllAsync = async () => {
    console.log('TipoEventoZonaSeguraService.getAllAsync()');
    const returnArray = await this.TipoEventoZonaSeguraRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`TipoEventoZonaSeguraService.getByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.TipoEventoZonaSeguraRepository.getByIdAsync(id);
  };

  createAsync = async (entity) => {
    console.log(`TipoEventoZonaSeguraService.createAsync(${JSON.stringify(entity)})`);
    if (!entity) throw new Error('La entidad es obligatoria.');
    return await this.TipoEventoZonaSeguraRepository.createAsync(entity);
  };

  updateAsync = async (entity) => {
    console.log(`TipoEventoZonaSeguraService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id es obligatorio para actualizar.');
    }
    const prev = await this.TipoEventoZonaSeguraRepository.getByIdAsync(entity.id);
    if (prev == null) return 0;
    return await this.TipoEventoZonaSeguraRepository.updateAsync(entity);
  };

  deleteByIdAsync = async (id) => {
    console.log(`TipoEventoZonaSeguraService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.TipoEventoZonaSeguraRepository.deleteByIdAsync(id);
  };
}
