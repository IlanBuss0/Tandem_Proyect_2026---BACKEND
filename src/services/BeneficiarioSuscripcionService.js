import BeneficiarioSuscripcionRepository from '../repositories/BeneficiarioSuscripcionRepository.js';

export default class BeneficiarioSuscripcionService {
  constructor() {
    this.BeneficiarioSuscripcionRepository = new BeneficiarioSuscripcionRepository();
  }

  getAllAsync = async () => await this.BeneficiarioSuscripcionRepository.getAllAsync();
  getByIdAsync = async (id) => await this.BeneficiarioSuscripcionRepository.getByIdAsync(id);
  createAsync = async (entity) => await this.BeneficiarioSuscripcionRepository.createAsync(entity);
  updateAsync = async (entity) => await this.BeneficiarioSuscripcionRepository.updateAsync(entity);
  deleteByIdAsync = async (id) => await this.BeneficiarioSuscripcionRepository.deleteByIdAsync(id);
}
