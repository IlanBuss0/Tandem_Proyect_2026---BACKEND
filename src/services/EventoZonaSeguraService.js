import EventoZonaSeguraRepository from '../repositories/EventoZonaSeguraRepository.js';

export default class EventoZonaSeguraService {
  constructor() {
    console.log('Estoy en: EventoZonaSeguraService.constructor()');
    this.EventoZonaSeguraRepository = new EventoZonaSeguraRepository();
  }

  getAllAsync = async () => {
    console.log('EventoZonaSeguraService.getAllAsync()');
    const returnArray = await this.EventoZonaSeguraRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`EventoZonaSeguraService.getByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id del evento de zona segura es inválido.');
    }
    const returnEntity = await this.EventoZonaSeguraRepository.getByIdAsync(id);
    return returnEntity;
  };

  createAsync = async (entity) => {
    console.log(`EventoZonaSeguraService.createAsync(${JSON.stringify(entity)})`);
    this.validarEventoParaCrear(entity);
    const newId = await this.EventoZonaSeguraRepository.createAsync(entity);
    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`EventoZonaSeguraService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id del evento de zona segura es obligatorio para actualizar.');
    }
    const previousEntity = await this.EventoZonaSeguraRepository.getByIdAsync(entity.id);
    if (previousEntity == null) return 0;
    const rowsAffected = await this.EventoZonaSeguraRepository.updateAsync(entity);
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`EventoZonaSeguraService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id del evento de zona segura es inválido.');
    }
    const rowsAffected = await this.EventoZonaSeguraRepository.deleteByIdAsync(id);
    return rowsAffected;
  };

  validarEventoParaCrear = (entity) => {
    if (!entity) {
      throw new Error('El evento de zona segura es obligatorio.');
    }
    if (!entity.id_zona_segura) {
      throw new Error('id_zona_segura es obligatorio.');
    }
    if (!entity.id_dispositivo) {
      throw new Error('id_dispositivo es obligatorio.');
    }
    if (!entity.id_tipo_evento_zona_segura) {
      throw new Error('id_tipo_evento_zona_segura es obligatorio.');
    }
    if (!entity.fecha_evento) {
      throw new Error('fecha_evento es obligatorio.');
    }
  };
}
