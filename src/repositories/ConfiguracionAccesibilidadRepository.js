import ConfigurationRepository from './base/ConfigurationRepository.js';

export default class ConfiguracionAccesibilidadRepository extends ConfigurationRepository {
  constructor() {
    super({ table: 'configuraciones_accesibilidad' });
  }
}
