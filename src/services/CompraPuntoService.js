import CompraPuntoRepository from '../repositories/CompraPuntoRepository.js';
import PertenecienteRepository from '../repositories/PertenecienteRepository.js';
import NotificationProducerService from './NotificationProducerService.js';

export default class CompraPuntoService {
  constructor() {
    console.log('Estoy en: CompraPuntoService.constructor()');
    this.CompraPuntoRepository = new CompraPuntoRepository();
    this.PertenecienteRepository = new PertenecienteRepository();
    this.NotificationProducerService = new NotificationProducerService();
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
      throw new Error('El id de la compra de puntos es invalido.');
    }
    const returnEntity = await this.CompraPuntoRepository.getByIdAsync(id);
    return returnEntity;
  };

  createAsync = async (entity) => {
    console.log(`CompraPuntoService.createAsync(${JSON.stringify(entity)})`);
    this.validarCompraParaCrear(entity);
    const newId = await this.CompraPuntoRepository.createAsync(entity);
    const perteneciente = await this.PertenecienteRepository.getByIdAsync(entity.id_perteneciente);
    await this.NotificationProducerService.createAsync({
      recipientUserId: entity.id_usuario,
      actorUserId: entity.id_usuario,
      contextUserId: perteneciente?.id_usuario ?? null,
      typeName: 'Información',
      title: entity.pagado ? 'Compra confirmada' : 'Compra registrada',
      body: entity.pagado ? 'Tu compra de puntos fue confirmada.' : 'Tu compra está pendiente de confirmación.',
      referenceType: 'payment',
      referenceId: newId,
    });
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
      throw new Error('El id de la compra de puntos es invalido.');
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
