import ActividadAsignadaRepository from '../repositories/ActividadAsignadaRepository.js';

export default class ActividadAsignadaService {
  constructor() {
    console.log('Estoy en: ActividadAsignadaService.constructor()');
    this.ActividadAsignadaRepository = new ActividadAsignadaRepository();
  }

  getAllAsync = async () => {
    console.log('ActividadAsignadaService.getAllAsync()');
    const returnArray = await this.ActividadAsignadaRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`ActividadAsignadaService.getByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id de la actividad asignada es inválido.');
    }
    const returnEntity = await this.ActividadAsignadaRepository.getByIdAsync(id);
    return returnEntity;
  };

  createAsync = async (entity) => {
    console.log(`ActividadAsignadaService.createAsync(${JSON.stringify(entity)})`);
    this.validarActividadAsignadaParaCrear(entity);
    const newId = await this.ActividadAsignadaRepository.createAsync(entity);
    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`ActividadAsignadaService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id de la actividad asignada es obligatorio para actualizar.');
    }
    const previousEntity = await this.ActividadAsignadaRepository.getByIdAsync(entity.id);
    if (previousEntity == null) return 0;
    const rowsAffected = await this.ActividadAsignadaRepository.updateAsync(entity);
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`ActividadAsignadaService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id de la actividad asignada es inválido.');
    }
    const rowsAffected = await this.ActividadAsignadaRepository.deleteByIdAsync(id);
    return rowsAffected;
  };

  validarActividadAsignadaParaCrear = (entity) => {
    if (!entity) {
      throw new Error('La actividad asignada es obligatoria.');
    }
    if (!entity.id_actividad && !entity.id_actividad_personalizada) {
      throw new Error('Se debe indicar id_actividad o id_actividad_personalizada.');
    }
    if (entity.id_actividad && entity.id_actividad_personalizada) {
      throw new Error('Solo se puede indicar id_actividad o id_actividad_personalizada, no ambos.');
    }
    if (!entity.id_perteneciente) {
      throw new Error('id_perteneciente es obligatorio.');
    }
    if (!entity.id_usuario_asignador) {
      throw new Error('id_usuario_asignador es obligatorio.');
    }
    if (!entity.id_estado_actividad) {
      throw new Error('id_estado_actividad es obligatorio.');
    }
    if (!entity.fecha_asignacion) {
      throw new Error('fecha_asignacion es obligatorio.');
    }
  };
}
