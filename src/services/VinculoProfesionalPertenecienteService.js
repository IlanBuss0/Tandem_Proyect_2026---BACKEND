import VinculoProfesionalPertenecienteRepository from '../repositories/VinculoProfesionalPertenecienteRepository.js';

export default class VinculoProfesionalPertenecienteService {
  constructor() {
    console.log('Estoy en: VinculoProfesionalPertenecienteService.constructor()');
    this.VinculoProfesionalPertenecienteRepository = new VinculoProfesionalPertenecienteRepository();
  }

  getAllAsync = async () => {
    console.log('VinculoProfesionalPertenecienteService.getAllAsync()');
    const returnArray = await this.VinculoProfesionalPertenecienteRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`VinculoProfesionalPertenecienteService.getByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.VinculoProfesionalPertenecienteRepository.getByIdAsync(id);
  };

  createAsync = async (entity) => {
    console.log(`VinculoProfesionalPertenecienteService.createAsync(${JSON.stringify(entity)})`);
    if (!entity) throw new Error('La entidad es obligatoria.');
    return await this.VinculoProfesionalPertenecienteRepository.createAsync(entity);
  };

  updateAsync = async (entity) => {
    console.log(`VinculoProfesionalPertenecienteService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id es obligatorio para actualizar.');
    }
    const prev = await this.VinculoProfesionalPertenecienteRepository.getByIdAsync(entity.id);
    if (prev == null) return 0;
    return await this.VinculoProfesionalPertenecienteRepository.updateAsync(entity);
  };

  deleteByIdAsync = async (id) => {
    console.log(`VinculoProfesionalPertenecienteService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id es inválido.');
    }
    return await this.VinculoProfesionalPertenecienteRepository.deleteByIdAsync(id);
  };
}
