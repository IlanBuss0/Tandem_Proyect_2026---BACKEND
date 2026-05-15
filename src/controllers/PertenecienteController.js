import PertenecienteRepository from '../repositories/PertenecienteRepository.js';

export default class PertenecienteService {
  constructor() {
    console.log('Estoy en: PertenecienteService.constructor()');
    this.PertenecienteRepository = new PertenecienteRepository();
  }

  getAllAsync = async () => {
    console.log('PertenecienteService.getAllAsync()');

    const returnArray = await this.PertenecienteRepository.getAllAsync();

    if (returnArray == null) return null;

    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`PertenecienteService.getByIdAsync(${id})`);

    if (!id || Number.isNaN(id)) {
      throw new Error('El id del perteneciente es inválido.');
    }

    const returnEntity = await this.PertenecienteRepository.getByIdAsync(id);

    return returnEntity;
  };

  createAsync = async (entity) => {
    console.log(`PertenecienteService.createAsync(${JSON.stringify(entity)})`);

    this.validarPertenecienteParaCrear(entity);

    const pertenecienteConMismoUsuario = await this.PertenecienteRepository.getByUsuarioIdAsync(entity.id_usuario);

    if (pertenecienteConMismoUsuario != null) {
      throw new Error(`Ya existe un perteneciente asociado al usuario con id ${entity.id_usuario}.`);
    }

    const newId = await this.PertenecienteRepository.createAsync(entity);

    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`PertenecienteService.updateAsync(${JSON.stringify(entity)})`);

    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id del perteneciente es obligatorio para actualizar.');
    }

    const previousEntity = await this.PertenecienteRepository.getByIdAsync(entity.id);

    if (previousEntity == null) {
      return 0;
    }

    if (entity.id_usuario && entity.id_usuario !== previousEntity.id_usuario) {
      const pertenecienteConMismoUsuario = await this.PertenecienteRepository.getByUsuarioIdAsync(entity.id_usuario);

      if (pertenecienteConMismoUsuario != null) {
        throw new Error(`Ya existe un perteneciente asociado al usuario con id ${entity.id_usuario}.`);
      }
    }

    const rowsAffected = await this.PertenecienteRepository.updateAsync(entity);

    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`PertenecienteService.deleteByIdAsync(${id})`);

    if (!id || Number.isNaN(id)) {
      throw new Error('El id del perteneciente es inválido.');
    }

    const rowsAffected = await this.PertenecienteRepository.deleteByIdAsync(id);

    return rowsAffected;
  };

  validarPertenecienteParaCrear = (entity) => {
    if (!entity) {
      throw new Error('El perteneciente es obligatorio.');
    }

    if (!entity.id_usuario) {
      throw new Error('id_usuario es obligatorio.');
    }

    if (!entity.id_nivel_apoyo) {
      throw new Error('id_nivel_apoyo es obligatorio.');
    }

    if (!entity.id_autonomia_operativa) {
      throw new Error('id_autonomia_operativa es obligatorio.');
    }
  };
}