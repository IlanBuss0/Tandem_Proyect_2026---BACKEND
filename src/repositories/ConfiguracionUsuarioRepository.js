import ConfigurationRepository from './base/ConfigurationRepository.js';

export default class ConfiguracionUsuarioRepository extends ConfigurationRepository {
  constructor() {
    super({ table: 'configuraciones_usuarios' });
  }
}
