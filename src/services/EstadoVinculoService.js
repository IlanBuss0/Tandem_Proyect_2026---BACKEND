import EstadoVinculoRepository from '../repositories/EstadoVinculoRepository.js';

export default class EstadoVinculoService {
  constructor() {
    console.log('Estoy en: EstadoVinculoService.constructor()');
    this.EstadoVinculoRepository = new EstadoVinculoRepository();
  }

  getAllAsync = async () => {
    console.log('EstadoVinculoService.getAllAsync()');
    const returnArray = await this.EstadoVinculoRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`EstadoVinculoService.getByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.EstadoVinculoRepository.getByIdAsync(id);
  };

  createAsync = async (entity) => {
    console.log(`EstadoVinculoService.createAsync(${JSON.stringify(entity)})`);
    if (!entity) throw new Error('La entidad es obligatoria.');
    return await this.EstadoVinculoRepository.createAsync(entity);
  };

  updateAsync = async (entity) => {
    console.log(`EstadoVinculoService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id es obligatorio para actualizar.');
    }
    const prev = await this.EstadoVinculoRepository.getByIdAsync(entity.id);
    if (prev == null) return 0;
    return await this.EstadoVinculoRepository.updateAsync(entity);
  };

  deleteByIdAsync = async (id) => {
    console.log(`EstadoVinculoService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.EstadoVinculoRepository.deleteByIdAsync(id);
  };
}
