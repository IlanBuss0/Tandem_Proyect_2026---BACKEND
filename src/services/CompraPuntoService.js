import CompraPuntoRepository from '../repositories/CompraPuntoRepository.js';

export default class CompraPuntoService {
  constructor() {
    console.log('Estoy en: CompraPuntoService.constructor()');
    this.CompraPuntoRepository = new CompraPuntoRepository();
  }

  getAllAsync = async () => {
    console.log('CompraPuntoService.getAllAsync()');
    const returnArray = await this.CompraPuntoRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`CompraPuntoService.getByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id de la compra de puntos es inválido.');
    }
    const returnEntity = await this.CompraPuntoRepository.getByIdAsync(id);
    return returnEntity;
  };

  createAsync = async (entity) => {
    console.log(`CompraPuntoService.createAsync(${JSON.stringify(entity)})`);
    this.validarCompraParaCrear(entity);
    const newId = await this.CompraPuntoRepository.createAsync(entity);
    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`CompraPuntoService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id de la compra de puntos es obligatorio para actualizar.');
    }
    const previousEntity = await this.CompraPuntoRepository.getByIdAsync(entity.id);
    if (previousEntity == null) return 0;
    const rowsAffected = await this.CompraPuntoRepository.updateAsync(entity);
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`CompraPuntoService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id de la compra de puntos es inválido.');
    }
    const rowsAffected = await this.CompraPuntoRepository.deleteByIdAsync(id);
    return rowsAffected;
  };

  validarCompraParaCrear = (entity) => {
    if (!entity) {
      throw new Error('La compra de puntos es obligatoria.');
    }
    if (!entity.id_usuario) {
      throw new Error('id_usuario es obligatorio.');
    }
    if (!entity.id_perteneciente) {
      throw new Error('id_perteneciente es obligatorio.');
    }
    if (!entity.id_paquete_punto) {
      throw new Error('id_paquete_punto es obligatorio.');
    }
    if (!entity.id_estado_pago) {
      throw new Error('id_estado_pago es obligatorio.');
    }
    if (!entity.fecha_compra) {
      throw new Error('fecha_compra es obligatorio.');
    }
  };
}
