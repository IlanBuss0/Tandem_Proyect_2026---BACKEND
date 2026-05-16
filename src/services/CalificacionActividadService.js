import CalificacionActividadRepository from '../repositories/CalificacionActividadRepository.js';

export default class CalificacionActividadService {
  constructor() {
    console.log('Estoy en: CalificacionActividadService.constructor()');
    this.CalificacionActividadRepository = new CalificacionActividadRepository();
  }

  getAllAsync = async () => {
    console.log('CalificacionActividadService.getAllAsync()');
    const returnArray = await this.CalificacionActividadRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`CalificacionActividadService.getByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id de la calificación es inválido.');
    }
    const returnEntity = await this.CalificacionActividadRepository.getByIdAsync(id);
    return returnEntity;
  };

  createAsync = async (entity) => {
    console.log(`CalificacionActividadService.createAsync(${JSON.stringify(entity)})`);
    this.validarCalificacionParaCrear(entity);
    const newId = await this.CalificacionActividadRepository.createAsync(entity);
    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`CalificacionActividadService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id de la calificación es obligatorio para actualizar.');
    }
    const previousEntity = await this.CalificacionActividadRepository.getByIdAsync(entity.id);
    if (previousEntity == null) return 0;
    const rowsAffected = await this.CalificacionActividadRepository.updateAsync(entity);
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`CalificacionActividadService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id de la calificación es inválido.');
    }
    const rowsAffected = await this.CalificacionActividadRepository.deleteByIdAsync(id);
    return rowsAffected;
  };

  validarCalificacionParaCrear = (entity) => {
    if (!entity) {
      throw new Error('La calificación es obligatoria.');
    }
    if (!entity.id_perteneciente) {
      throw new Error('id_perteneciente es obligatorio.');
    }
    if (!entity.id_actividad && !entity.id_actividad_personalizada) {
      throw new Error('Se debe indicar id_actividad o id_actividad_personalizada.');
    }
    if (entity.id_actividad && entity.id_actividad_personalizada) {
      throw new Error('Solo se puede indicar id_actividad o id_actividad_personalizada, no ambos.');
    }
    if (!entity.puntaje_usuario || entity.puntaje_usuario < 1 || entity.puntaje_usuario > 5) {
      throw new Error('puntaje_usuario es obligatorio y debe estar entre 1 y 5.');
    }
    if (!entity.fecha_calificacion) {
      throw new Error('fecha_calificacion es obligatorio.');
    }
  };
}
