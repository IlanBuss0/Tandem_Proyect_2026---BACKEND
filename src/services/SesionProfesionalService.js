import SesionProfesionalRepository from '../repositories/SesionProfesionalRepository.js';

export default class SesionProfesionalService {
  constructor() {
    console.log('Estoy en: SesionProfesionalService.constructor()');
    this.SesionProfesionalRepository = new SesionProfesionalRepository();
  }

  getAllAsync = async () => {
    console.log('SesionProfesionalService.getAllAsync()');
    const returnArray = await this.SesionProfesionalRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`SesionProfesionalService.getByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id de la sesión profesional es inválido.');
    }
    const returnEntity = await this.SesionProfesionalRepository.getByIdAsync(id);
    return returnEntity;
  };

  createAsync = async (entity) => {
    console.log(`SesionProfesionalService.createAsync(${JSON.stringify(entity)})`);
    this.validarSesionParaCrear(entity);
    const newId = await this.SesionProfesionalRepository.createAsync(entity);
    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`SesionProfesionalService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id de la sesión profesional es obligatorio para actualizar.');
    }
    const previousEntity = await this.SesionProfesionalRepository.getByIdAsync(entity.id);
    if (previousEntity == null) return 0;
    const rowsAffected = await this.SesionProfesionalRepository.updateAsync(entity);
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`SesionProfesionalService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id de la sesión profesional es inválido.');
    }
    const rowsAffected = await this.SesionProfesionalRepository.deleteByIdAsync(id);
    return rowsAffected;
  };

  validarSesionParaCrear = (entity) => {
    if (!entity) {
      throw new Error('La sesión profesional es obligatoria.');
    }
    if (!entity.id_profesional) {
      throw new Error('id_profesional es obligatorio.');
    }
    if (!entity.id_perteneciente) {
      throw new Error('id_perteneciente es obligatorio.');
    }
    if (!entity.fecha_sesion) {
      throw new Error('fecha_sesion es obligatorio.');
    }
  };
}
