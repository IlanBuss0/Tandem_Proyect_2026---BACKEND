import SaldoPuntoRepository from '../repositories/SaldoPuntoRepository.js';

export default class SaldoPuntoService {
  constructor() {
    console.log('Estoy en: SaldoPuntoService.constructor()');
    this.SaldoPuntoRepository = new SaldoPuntoRepository();
  }

  getAllAsync = async () => {
    console.log('SaldoPuntoService.getAllAsync()');
    const returnArray = await this.SaldoPuntoRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`SaldoPuntoService.getByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id del saldo de puntos es inválido.');
    }
    const returnEntity = await this.SaldoPuntoRepository.getByIdAsync(id);
    return returnEntity;
  };

  createAsync = async (entity) => {
    console.log(`SaldoPuntoService.createAsync(${JSON.stringify(entity)})`);
    this.validarSaldoPuntoParaCrear(entity);

    const saldoConMismoPerteneciente = await this.SaldoPuntoRepository.getByPertenecienteIdAsync(entity.id_perteneciente);

    if (saldoConMismoPerteneciente != null) {
      throw new Error(`Ya existe un saldo de puntos para el perteneciente con id ${entity.id_perteneciente}.`);
    }

    const newId = await this.SaldoPuntoRepository.createAsync(entity);
    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`SaldoPuntoService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id del saldo de puntos es obligatorio para actualizar.');
    }
    const previousEntity = await this.SaldoPuntoRepository.getByIdAsync(entity.id);
    if (previousEntity == null) return 0;
    const rowsAffected = await this.SaldoPuntoRepository.updateAsync(entity);
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`SaldoPuntoService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id del saldo de puntos es inválido.');
    }
    const rowsAffected = await this.SaldoPuntoRepository.deleteByIdAsync(id);
    return rowsAffected;
  };

  validarSaldoPuntoParaCrear = (entity) => {
    if (!entity) {
      throw new Error('El saldo de puntos es obligatorio.');
    }
    if (!entity.id_perteneciente) {
      throw new Error('id_perteneciente es obligatorio.');
    }
  };
}
