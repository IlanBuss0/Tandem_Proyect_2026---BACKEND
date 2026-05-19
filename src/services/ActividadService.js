import ActividadRepository from '../repositories/ActividadRepository.js';

export default class ActividadService {
  constructor() {
    console.log('Estoy en: ActividadService.constructor()');
    this.ActividadRepository = new ActividadRepository();
  }

  getAllAsync = async () => {
    console.log('ActividadService.getAllAsync()');
    const returnArray = await this.ActividadRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`ActividadService.getByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id de la actividad es invalido.');
    }
    const returnEntity = await this.ActividadRepository.getByIdAsync(id);
    return returnEntity;
  };

  createAsync = async (entity) => {
    console.log(`ActividadService.createAsync(${JSON.stringify(entity)})`);
    this.validarActividadParaCrear(entity);
    const newId = await this.ActividadRepository.createAsync(entity);
    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`ActividadService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id de la actividad es obligatorio para actualizar.');
    }
    const previousEntity = await this.ActividadRepository.getByIdAsync(entity.id);
    if (previousEntity == null) return 0;
    const rowsAffected = await this.ActividadRepository.updateAsync(entity);
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`ActividadService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id de la actividad es invalido.');
    }
    const rowsAffected = await this.ActividadRepository.deleteByIdAsync(id);
    return rowsAffected;
  };

  validarActividadParaCrear = (entity) => {
    if (!entity) {
      throw new Error('La actividad es obligatoria.');
    }
    if (!entity.id_tipo_actividad) {
      throw new Error('id_tipo_actividad es obligatorio.');
    }
    if (!entity.id_punto_otorgado) {
      throw new Error('id_punto_otorgado es obligatorio.');
    }
    if (!entity.titulo) {
      throw new Error('titulo es obligatorio.');
    }
  };
}
