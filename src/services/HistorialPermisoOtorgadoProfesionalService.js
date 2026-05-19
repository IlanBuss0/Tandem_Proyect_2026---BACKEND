import HistorialPermisoOtorgadoProfesionalRepository from '../repositories/HistorialPermisoOtorgadoProfesionalRepository.js';

export default class HistorialPermisoOtorgadoProfesionalService {
  constructor() {
    console.log('Estoy en: HistorialPermisoOtorgadoProfesionalService.constructor()');
    this.HistorialPermisoOtorgadoProfesionalRepository = new HistorialPermisoOtorgadoProfesionalRepository();
  }

  getAllAsync = async () => {
    console.log('HistorialPermisoOtorgadoProfesionalService.getAllAsync()');
    const returnArray = await this.HistorialPermisoOtorgadoProfesionalRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`HistorialPermisoOtorgadoProfesionalService.getByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.HistorialPermisoOtorgadoProfesionalRepository.getByIdAsync(id);
  };

  createAsync = async (entity) => {
    console.log(`HistorialPermisoOtorgadoProfesionalService.createAsync(${JSON.stringify(entity)})`);
    if (!entity) throw new Error('La entidad es obligatoria.');
    return await this.HistorialPermisoOtorgadoProfesionalRepository.createAsync(entity);
  };

  updateAsync = async (entity) => {
    console.log(`HistorialPermisoOtorgadoProfesionalService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id es obligatorio para actualizar.');
    }
    const prev = await this.HistorialPermisoOtorgadoProfesionalRepository.getByIdAsync(entity.id);
    if (prev == null) return 0;
    return await this.HistorialPermisoOtorgadoProfesionalRepository.updateAsync(entity);
  };

  deleteByIdAsync = async (id) => {
    console.log(`HistorialPermisoOtorgadoProfesionalService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.HistorialPermisoOtorgadoProfesionalRepository.deleteByIdAsync(id);
  };
}
