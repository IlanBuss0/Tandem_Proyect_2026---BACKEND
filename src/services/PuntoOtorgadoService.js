import PuntoOtorgadoRepository from '../repositories/PuntoOtorgadoRepository.js';

export default class PuntoOtorgadoService {
  constructor() {
    console.log('Estoy en: PuntoOtorgadoService.constructor()');
    this.PuntoOtorgadoRepository = new PuntoOtorgadoRepository();
  }

  getAllAsync = async () => {
    console.log('PuntoOtorgadoService.getAllAsync()');
    const returnArray = await this.PuntoOtorgadoRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`PuntoOtorgadoService.getByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.PuntoOtorgadoRepository.getByIdAsync(id);
  };

  createAsync = async (entity) => {
    console.log(`PuntoOtorgadoService.createAsync(${JSON.stringify(entity)})`);
    if (!entity) throw new Error('La entidad es obligatoria.');
    return await this.PuntoOtorgadoRepository.createAsync(entity);
  };

  updateAsync = async (entity) => {
    console.log(`PuntoOtorgadoService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id es obligatorio para actualizar.');
    }
    const prev = await this.PuntoOtorgadoRepository.getByIdAsync(entity.id);
    if (prev == null) return 0;
    return await this.PuntoOtorgadoRepository.updateAsync(entity);
  };

  deleteByIdAsync = async (id) => {
    console.log(`PuntoOtorgadoService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.PuntoOtorgadoRepository.deleteByIdAsync(id);
  };
}
