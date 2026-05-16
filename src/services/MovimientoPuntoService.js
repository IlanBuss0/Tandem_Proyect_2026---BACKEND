import MovimientoPuntoRepository from '../repositories/MovimientoPuntoRepository.js';

export default class MovimientoPuntoService {
  constructor() {
    console.log('Estoy en: MovimientoPuntoService.constructor()');
    this.MovimientoPuntoRepository = new MovimientoPuntoRepository();
  }

  getAllAsync = async () => {
    console.log('MovimientoPuntoService.getAllAsync()');
    const returnArray = await this.MovimientoPuntoRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`MovimientoPuntoService.getByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id del movimiento de puntos es inválido.');
    }
    const returnEntity = await this.MovimientoPuntoRepository.getByIdAsync(id);
    return returnEntity;
  };

  createAsync = async (entity) => {
    console.log(`MovimientoPuntoService.createAsync(${JSON.stringify(entity)})`);
    this.validarMovimientoPuntoParaCrear(entity);
    const newId = await this.MovimientoPuntoRepository.createAsync(entity);
    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`MovimientoPuntoService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id del movimiento de puntos es obligatorio para actualizar.');
    }
    const previousEntity = await this.MovimientoPuntoRepository.getByIdAsync(entity.id);
    if (previousEntity == null) return 0;
    const rowsAffected = await this.MovimientoPuntoRepository.updateAsync(entity);
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`MovimientoPuntoService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id del movimiento de puntos es inválido.');
    }
    const rowsAffected = await this.MovimientoPuntoRepository.deleteByIdAsync(id);
    return rowsAffected;
  };

  validarMovimientoPuntoParaCrear = (entity) => {
    if (!entity) {
      throw new Error('El movimiento de puntos es obligatorio.');
    }
    if (!entity.id_perteneciente) {
      throw new Error('id_perteneciente es obligatorio.');
    }
    if (!entity.id_tipo_movimiento_punto) {
      throw new Error('id_tipo_movimiento_punto es obligatorio.');
    }
    if (!entity.cantidad) {
      throw new Error('cantidad es obligatorio.');
    }
    if (!entity.fecha_movimiento) {
      throw new Error('fecha_movimiento es obligatorio.');
    }
  };
}
