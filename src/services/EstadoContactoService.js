import EstadoContactoRepository from '../repositories/EstadoContactoRepository.js';

export default class EstadoContactoService {
  constructor() {
    console.log('Estoy en: EstadoContactoService.constructor()');
    this.EstadoContactoRepository = new EstadoContactoRepository();
  }

  getAllAsync = async () => {
    console.log('EstadoContactoService.getAllAsync()');
    const returnArray = await this.EstadoContactoRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`EstadoContactoService.getByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.EstadoContactoRepository.getByIdAsync(id);
  };

  createAsync = async (entity) => {
    console.log(`EstadoContactoService.createAsync(${JSON.stringify(entity)})`);
    if (!entity) throw new Error('La entidad es obligatoria.');
    return await this.EstadoContactoRepository.createAsync(entity);
  };

  updateAsync = async (entity) => {
    console.log(`EstadoContactoService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id es obligatorio para actualizar.');
    }
    const prev = await this.EstadoContactoRepository.getByIdAsync(entity.id);
    if (prev == null) return 0;
    return await this.EstadoContactoRepository.updateAsync(entity);
  };

  deleteByIdAsync = async (id) => {
    console.log(`EstadoContactoService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.EstadoContactoRepository.deleteByIdAsync(id);
  };
}
