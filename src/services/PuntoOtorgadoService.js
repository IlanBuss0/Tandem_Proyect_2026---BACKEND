import PuntoOtorgadoRepository from '../repositories/PuntoOtorgadoRepository.js';

export default class PuntoOtorgadoService {
  constructor() {
    this.PuntoOtorgadoRepository = new PuntoOtorgadoRepository();
  }

  getAllAsync = async () => await this.PuntoOtorgadoRepository.getAllAsync();
  getByIdAsync = async (id) => await this.PuntoOtorgadoRepository.getByIdAsync(id);
  createAsync = async (entity) => await this.PuntoOtorgadoRepository.createAsync(entity);
  updateAsync = async (entity) => await this.PuntoOtorgadoRepository.updateAsync(entity);
  deleteByIdAsync = async (id) => await this.PuntoOtorgadoRepository.deleteByIdAsync(id);
}
