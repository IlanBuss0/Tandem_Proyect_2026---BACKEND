import EvaluacionAutonomiaRepository from '../repositories/EvaluacionAutonomiaRepository.js';

export default class EvaluacionAutonomiaService {
  constructor() {
    console.log('Estoy en: EvaluacionAutonomiaService.constructor()');
    this.EvaluacionAutonomiaRepository = new EvaluacionAutonomiaRepository();
  }

  getAllAsync = async () => {
    console.log('EvaluacionAutonomiaService.getAllAsync()');
    const returnArray = await this.EvaluacionAutonomiaRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`EvaluacionAutonomiaService.getByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id de la evaluacion de autonomia es invalido.');
    }
    const returnEntity = await this.EvaluacionAutonomiaRepository.getByIdAsync(id);
    return returnEntity;
  };

  createAsync = async (entity) => {
    console.log(`EvaluacionAutonomiaService.createAsync(${JSON.stringify(entity)})`);
    this.validarEvaluacionParaCrear(entity);
    const newId = await this.EvaluacionAutonomiaRepository.createAsync(entity);
    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`EvaluacionAutonomiaService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id de la evaluacion es obligatorio para actualizar.');
    }
    const previousEntity = await this.EvaluacionAutonomiaRepository.getByIdAsync(entity.id);
    if (previousEntity == null) return 0;
    const rowsAffected = await this.EvaluacionAutonomiaRepository.updateAsync(entity);
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`EvaluacionAutonomiaService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id de la evaluacion es invalido.');
    }
    const rowsAffected = await this.EvaluacionAutonomiaRepository.deleteByIdAsync(id);
    return rowsAffected;
  };

  validarEvaluacionParaCrear = (entity) => {
    if (!entity) {
      throw new Error('La evaluacion de autonomia es obligatoria.');
    }
    if (!entity.id_perteneciente) {
      throw new Error('id_perteneciente es obligatorio.');
    }
    if (!entity.id_nivel_apoyo_nuevo) {
      throw new Error('id_nivel_apoyo_nuevo es obligatorio.');
    }
    if (!entity.id_autonomia_operativa_nueva) {
      throw new Error('id_autonomia_operativa_nueva es obligatorio.');
    }
    if (entity.puede_autogestionarse_nuevo === undefined || entity.puede_autogestionarse_nuevo === null) {
      throw new Error('puede_autogestionarse_nuevo es obligatorio.');
    }
    if (!entity.fecha_evaluacion) {
      throw new Error('fecha_evaluacion es obligatorio.');
    }
  };
}
