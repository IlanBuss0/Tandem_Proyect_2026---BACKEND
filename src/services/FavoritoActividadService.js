import FavoritoActividadRepository from '../repositories/FavoritoActividadRepository.js';

export default class FavoritoActividadService {
  constructor() {
    console.log('Estoy en: FavoritoActividadService.constructor()');
    this.FavoritoActividadRepository = new FavoritoActividadRepository();
  }

  getAllAsync = async () => {
    console.log('FavoritoActividadService.getAllAsync()');
    const returnArray = await this.FavoritoActividadRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`FavoritoActividadService.getByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id del favorito es invalido.');
    }
    const returnEntity = await this.FavoritoActividadRepository.getByIdAsync(id);
    return returnEntity;
  };

  createAsync = async (entity) => {
    console.log(`FavoritoActividadService.createAsync(${JSON.stringify(entity)})`);
    this.validarFavoritoParaCrear(entity);
    const newId = await this.FavoritoActividadRepository.createAsync(entity);
    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`FavoritoActividadService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id del favorito es obligatorio para actualizar.');
    }
    const previousEntity = await this.FavoritoActividadRepository.getByIdAsync(entity.id);
    if (previousEntity == null) return 0;
    const rowsAffected = await this.FavoritoActividadRepository.updateAsync(entity);
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`FavoritoActividadService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id del favorito es invalido.');
    }
    const rowsAffected = await this.FavoritoActividadRepository.deleteByIdAsync(id);
    return rowsAffected;
  };

  validarFavoritoParaCrear = (entity) => {
    if (!entity) {
      throw new Error('El favorito es obligatorio.');
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
    if (!entity.fecha_marcado) {
      throw new Error('fecha_marcado es obligatorio.');
    }
  };
}
