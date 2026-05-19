import ProfesionalRepository from '../repositories/ProfesionalRepository.js';

export default class ProfesionalService {
  constructor() {
    console.log('Estoy en: ProfesionalService.constructor()');
    this.ProfesionalRepository = new ProfesionalRepository();
  }

  getAllAsync = async () => {
    console.log('ProfesionalService.getAllAsync()');

    const returnArray = await this.ProfesionalRepository.getAllAsync();

    if (returnArray == null) return null;

    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`ProfesionalService.getByIdAsync(${id})`);

    if (!id || Number.isNaN(id)) {
      throw new Error('El id del profesional es invalido.');
    }

    const returnEntity = await this.ProfesionalRepository.getByIdAsync(id);

    return returnEntity;
  };

  createAsync = async (entity) => {
    console.log(`ProfesionalService.createAsync(${JSON.stringify(entity)})`);

    this.validarProfesionalParaCrear(entity);

    const profesionalConMismoUsuario = await this.ProfesionalRepository.getByUsuarioIdAsync(entity.id_usuario);

    if (profesionalConMismoUsuario != null) {
      throw new Error(`Ya existe un profesional asociado al usuario con id ${entity.id_usuario}.`);
    }

    const profesionalConMismaMatricula = await this.ProfesionalRepository.getByMatriculaAsync(entity.matricula);

    if (profesionalConMismaMatricula != null) {
      throw new Error(`Ya existe un profesional con la matricula ${entity.matricula}.`);
    }

    const newId = await this.ProfesionalRepository.createAsync(entity);

    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`ProfesionalService.updateAsync(${JSON.stringify(entity)})`);

    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id del profesional es obligatorio para actualizar.');
    }

    const previousEntity = await this.ProfesionalRepository.getByIdAsync(entity.id);

    if (previousEntity == null) {
      return 0;
    }

    if (entity.id_usuario && entity.id_usuario !== previousEntity.id_usuario) {
      const profesionalConMismoUsuario = await this.ProfesionalRepository.getByUsuarioIdAsync(entity.id_usuario);

      if (profesionalConMismoUsuario != null) {
        throw new Error(`Ya existe un profesional asociado al usuario con id ${entity.id_usuario}.`);
      }
    }

    if (entity.matricula && entity.matricula !== previousEntity.matricula) {
      const profesionalConMismaMatricula = await this.ProfesionalRepository.getByMatriculaAsync(entity.matricula);

      if (profesionalConMismaMatricula != null) {
        throw new Error(`Ya existe un profesional con la matricula ${entity.matricula}.`);
      }
    }

    const rowsAffected = await this.ProfesionalRepository.updateAsync(entity);

    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`ProfesionalService.deleteByIdAsync(${id})`);

    if (!id || Number.isNaN(id)) {
      throw new Error('El id del profesional es invalido.');
    }

    const rowsAffected = await this.ProfesionalRepository.deleteByIdAsync(id);

    return rowsAffected;
  };

  validarProfesionalParaCrear = (entity) => {
    if (!entity) {
      throw new Error('El profesional es obligatorio.');
    }

    if (!entity.id_usuario) {
      throw new Error('id_usuario es obligatorio.');
    }

    if (!entity.profesion) {
      throw new Error('profesion es obligatorio.');
    }

    if (!entity.matricula) {
      throw new Error('matricula es obligatorio.');
    }

    if (!entity.id_estado_validacion) {
      throw new Error('id_estado_validacion es obligatorio.');
    }
  };
}