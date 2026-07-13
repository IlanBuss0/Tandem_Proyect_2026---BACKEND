import ActividadPersonalizadaRepository from '../repositories/ActividadPersonalizadaRepository.js';

export default class ActividadPersonalizadaService {
  constructor() {
    console.log('Estoy en: ActividadPersonalizadaService.constructor()');
    this.ActividadPersonalizadaRepository = new ActividadPersonalizadaRepository();
  }

  getAllAsync = async () => {
    console.log('ActividadPersonalizadaService.getAllAsync()');
    const returnArray = await this.ActividadPersonalizadaRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`ActividadPersonalizadaService.getByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id de la actividad personalizada es invalido.');
    }
    const returnEntity = await this.ActividadPersonalizadaRepository.getByIdAsync(id);
    return returnEntity;
  };

  getByUsuarioCreadorAsync = async (idUsuarioCreador) => {
    console.log(`ActividadPersonalizadaService.getByUsuarioCreadorAsync(${idUsuarioCreador})`);
    if (!idUsuarioCreador || Number.isNaN(idUsuarioCreador)) {
      throw new Error('El id del usuario creador es invalido.');
    }
    return await this.ActividadPersonalizadaRepository.getByUsuarioCreadorAsync(idUsuarioCreador);
  };

  getByPertenecienteIdAsync = async (idPerteneciente) => {
    console.log(`ActividadPersonalizadaService.getByPertenecienteIdAsync(${idPerteneciente})`);
    if (!idPerteneciente || Number.isNaN(idPerteneciente)) {
      throw new Error('El id del perteneciente es invalido.');
    }
    return await this.ActividadPersonalizadaRepository.getByPertenecienteIdAsync(idPerteneciente);
  };

  createAsync = async (entity) => {
    console.log(`ActividadPersonalizadaService.createAsync(${JSON.stringify(entity)})`);
    this.validarActividadPersonalizadaParaCrear(entity);
    const newId = await this.ActividadPersonalizadaRepository.createAsync(entity);
    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`ActividadPersonalizadaService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id de la actividad personalizada es obligatorio para actualizar.');
    }
    const previousEntity = await this.ActividadPersonalizadaRepository.getByIdAsync(entity.id);
    if (previousEntity == null) return 0;
    const rowsAffected = await this.ActividadPersonalizadaRepository.updateAsync(entity);
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`ActividadPersonalizadaService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id de la actividad personalizada es invalido.');
    }
    const rowsAffected = await this.ActividadPersonalizadaRepository.deleteByIdAsync(id);
    return rowsAffected;
  };

  validarActividadPersonalizadaParaCrear = (entity) => {
    if (!entity) {
      throw new Error('La actividad personalizada es obligatoria.');
    }
    if (!entity.id_tipo_actividad) {
      throw new Error('id_tipo_actividad es obligatorio.');
    }
    if (!entity.id_punto_otorgado) {
      throw new Error('id_punto_otorgado es obligatorio.');
    }
    if (!entity.id_usuario_creador) {
      throw new Error('id_usuario_creador es obligatorio.');
    }
    if (!entity.titulo) {
      throw new Error('titulo es obligatorio.');
    }
    if (!entity.fecha_creacion) {
      throw new Error('fecha_creacion es obligatorio.');
    }
  };
}
