import NivelApoyoRepository from '../repositories/NivelApoyoRepository.js';

export default class NivelApoyoService {
  constructor() {
    console.log('Estoy en: NivelApoyoService.constructor()');
    this.NivelApoyoRepository = new NivelApoyoRepository();
  }

  getAllAsync = async () => {
    console.log('NivelApoyoService.getAllAsync()');
    const returnArray = await this.NivelApoyoRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`NivelApoyoService.getByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.NivelApoyoRepository.getByIdAsync(id);
  };

  createAsync = async (entity) => {
    console.log(`NivelApoyoService.createAsync(${JSON.stringify(entity)})`);
    if (!entity) throw new Error('La entidad es obligatoria.');
    return await this.NivelApoyoRepository.createAsync(entity);
  };

  updateAsync = async (entity) => {
    console.log(`NivelApoyoService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id es obligatorio para actualizar.');
    }
    const prev = await this.NivelApoyoRepository.getByIdAsync(entity.id);
    if (prev == null) return 0;
    return await this.NivelApoyoRepository.updateAsync(entity);
  };

  deleteByIdAsync = async (id) => {
    console.log(`NivelApoyoService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.NivelApoyoRepository.deleteByIdAsync(id);
  };
}
