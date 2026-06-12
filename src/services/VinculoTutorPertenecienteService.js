import VinculoTutorPertenecienteRepository from '../repositories/VinculoTutorPertenecienteRepository.js';

export default class VinculoTutorPertenecienteService {
  constructor() {
    console.log('Estoy en: VinculoTutorPertenecienteService.constructor()');
    this.VinculoTutorPertenecienteRepository = new VinculoTutorPertenecienteRepository();
  }

  getAllAsync = async () => {
    console.log('VinculoTutorPertenecienteService.getAllAsync()');

    const returnArray = await this.VinculoTutorPertenecienteRepository.getAllAsync();

    if (returnArray == null) return null;

    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`VinculoTutorPertenecienteService.getByIdAsync(${id})`);

    if (!id || Number.isNaN(id)) {
      throw new Error('El id del vinculo es invalido.');
    }

    const returnEntity = await this.VinculoTutorPertenecienteRepository.getByIdAsync(id);

    return returnEntity;
  };

  getByPertenecienteIdAsync = async (idPerteneciente) => {
    console.log(`VinculoTutorPertenecienteService.getByPertenecienteIdAsync(${idPerteneciente})`);

    if (!idPerteneciente || Number.isNaN(idPerteneciente)) {
      throw new Error('El id del perteneciente es invalido.');
    }

    return await this.VinculoTutorPertenecienteRepository.getByPertenecienteIdAsync(idPerteneciente);
  };

  getByTutorYPertenecienteAsync = async (idTutor, idPerteneciente) => {
    return await this.VinculoTutorPertenecienteRepository.getByTutorYPertenecienteAsync(idTutor, idPerteneciente);
  };

  getByTutorIdAsync = async (idTutor) => {
    console.log(`VinculoTutorPertenecienteService.getByTutorIdAsync(${idTutor})`);

    if (!idTutor || Number.isNaN(idTutor)) {
      throw new Error('El id del tutor es invalido.');
    }

    return await this.VinculoTutorPertenecienteRepository.getByTutorIdAsync(idTutor);
  };

  createAsync = async (entity) => {
    console.log(`VinculoTutorPertenecienteService.createAsync(${JSON.stringify(entity)})`);

    this.validarVinculoParaCrear(entity);

    const vinculoExistente = await this.VinculoTutorPertenecienteRepository.getByTutorYPertenecienteAsync(
      entity.id_tutor,
      entity.id_perteneciente
    );

    if (vinculoExistente != null) {
      throw new Error(`Ya existe un vinculo entre el tutor ${entity.id_tutor} y el perteneciente ${entity.id_perteneciente}.`);
    }

    if (entity.es_tutor_principal === true) {
      const tutorPrincipalExistente = await this.VinculoTutorPertenecienteRepository.getTutorPrincipalByPertenecienteAsync(
        entity.id_perteneciente
      );

      if (tutorPrincipalExistente != null) {
        throw new Error(`El perteneciente ${entity.id_perteneciente} ya tiene un tutor principal activo.`);
      }
    }

    const newId = await this.VinculoTutorPertenecienteRepository.createAsync(entity);

    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`VinculoTutorPertenecienteService.updateAsync(${JSON.stringify(entity)})`);

    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id del vinculo es obligatorio para actualizar.');
    }

    const previousEntity = await this.VinculoTutorPertenecienteRepository.getByIdAsync(entity.id);

    if (previousEntity == null) {
      return 0;
    }

    if (
      entity.es_tutor_principal === true &&
      previousEntity.es_tutor_principal !== true
    ) {
      const tutorPrincipalExistente = await this.VinculoTutorPertenecienteRepository.getTutorPrincipalByPertenecienteAsync(
        entity.id_perteneciente ?? previousEntity.id_perteneciente
      );

      if (tutorPrincipalExistente != null && tutorPrincipalExistente.id !== entity.id) {
        throw new Error(`El perteneciente ya tiene un tutor principal activo.`);
      }
    }

    const rowsAffected = await this.VinculoTutorPertenecienteRepository.updateAsync(entity);

    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`VinculoTutorPertenecienteService.deleteByIdAsync(${id})`);

    if (!id || Number.isNaN(id)) {
      throw new Error('El id del vinculo es invalido.');
    }

    const rowsAffected = await this.VinculoTutorPertenecienteRepository.deleteByIdAsync(id);

    return rowsAffected;
  };

  validarVinculoParaCrear = (entity) => {
    if (!entity) {
      throw new Error('El vinculo es obligatorio.');
    }

    if (!entity.id_tutor) {
      throw new Error('id_tutor es obligatorio.');
    }

    if (!entity.id_perteneciente) {
      throw new Error('id_perteneciente es obligatorio.');
    }

    if (!entity.id_estado_vinculo) {
      throw new Error('id_estado_vinculo es obligatorio.');
    }

    if (!entity.fecha_alta) {
      throw new Error('fecha_alta es obligatorio.');
    }
  };
}