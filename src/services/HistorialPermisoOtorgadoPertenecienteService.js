import HistorialPermisoOtorgadoPertenecienteRepository from '../repositories/HistorialPermisoOtorgadoPertenecienteRepository.js';

export default class HistorialPermisoOtorgadoPertenecienteService {
  constructor() {
    console.log('Estoy en: HistorialPermisoOtorgadoPertenecienteService.constructor()');
    this.HistorialPermisoOtorgadoPertenecienteRepository = new HistorialPermisoOtorgadoPertenecienteRepository();
  }

  getAllAsync = async () => {
    console.log('HistorialPermisoOtorgadoPertenecienteService.getAllAsync()');
    const returnArray = await this.HistorialPermisoOtorgadoPertenecienteRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`HistorialPermisoOtorgadoPertenecienteService.getByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.HistorialPermisoOtorgadoPertenecienteRepository.getByIdAsync(id);
  };

  createAsync = async (entity) => {
    console.log(`HistorialPermisoOtorgadoPertenecienteService.createAsync(${JSON.stringify(entity)})`);
    if (!entity) throw new Error('La entidad es obligatoria.');
    return await this.HistorialPermisoOtorgadoPertenecienteRepository.createAsync(entity);
  };

  updateAsync = async (entity) => {
    console.log(`HistorialPermisoOtorgadoPertenecienteService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id es obligatorio para actualizar.');
    }
    const prev = await this.HistorialPermisoOtorgadoPertenecienteRepository.getByIdAsync(entity.id);
    if (prev == null) return 0;
    return await this.HistorialPermisoOtorgadoPertenecienteRepository.updateAsync(entity);
  };

  deleteByIdAsync = async (id) => {
    console.log(`HistorialPermisoOtorgadoPertenecienteService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.HistorialPermisoOtorgadoPertenecienteRepository.deleteByIdAsync(id);
  };
}
