import PermisoOtorgadoPertenecienteRepository from '../repositories/PermisoOtorgadoPertenecienteRepository.js';

export default class PermisoOtorgadoPertenecienteService {
  constructor() {
    console.log('Estoy en: PermisoOtorgadoPertenecienteService.constructor()');
    this.PermisoOtorgadoPertenecienteRepository = new PermisoOtorgadoPertenecienteRepository();
  }

  getAllAsync = async () => {
    console.log('PermisoOtorgadoPertenecienteService.getAllAsync()');
    const returnArray = await this.PermisoOtorgadoPertenecienteRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`PermisoOtorgadoPertenecienteService.getByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.PermisoOtorgadoPertenecienteRepository.getByIdAsync(id);
  };

  createAsync = async (entity) => {
    console.log(`PermisoOtorgadoPertenecienteService.createAsync(${JSON.stringify(entity)})`);
    if (!entity) throw new Error('La entidad es obligatoria.');
    return await this.PermisoOtorgadoPertenecienteRepository.createAsync(entity);
  };

  updateAsync = async (entity) => {
    console.log(`PermisoOtorgadoPertenecienteService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id es obligatorio para actualizar.');
    }
    const prev = await this.PermisoOtorgadoPertenecienteRepository.getByIdAsync(entity.id);
    if (prev == null) return 0;
    return await this.PermisoOtorgadoPertenecienteRepository.updateAsync(entity);
  };

  deleteByIdAsync = async (id) => {
    console.log(`PermisoOtorgadoPertenecienteService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.PermisoOtorgadoPertenecienteRepository.deleteByIdAsync(id);
  };
}
