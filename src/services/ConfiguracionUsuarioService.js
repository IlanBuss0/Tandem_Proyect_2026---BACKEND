import ConfiguracionUsuarioRepository from '../repositories/ConfiguracionUsuarioRepository.js';

export default class ConfiguracionUsuarioService {
  constructor() {
    console.log('Estoy en: ConfiguracionUsuarioService.constructor()');
    this.ConfiguracionUsuarioRepository = new ConfiguracionUsuarioRepository();
  }

  getAllAsync = async () => { console.log('ConfiguracionUsuarioService.getAllAsync()'); const r = await this.ConfiguracionUsuarioRepository.getAllAsync(); if (r == null) return null; return r; };
  getByIdAsync = async (id) => { console.log(`ConfiguracionUsuarioService.getByIdAsync(${id})`); if (!id || Number.isNaN(id)) { throw new Error('El id de la configuración es inválido.'); } return await this.ConfiguracionUsuarioRepository.getByIdAsync(id); };

  createAsync = async (entity) => {
    console.log(`ConfiguracionUsuarioService.createAsync(${JSON.stringify(entity)})`);
    this.validarConfigParaCrear(entity);
    const existente = await this.ConfiguracionUsuarioRepository.getByUsuarioAndClaveAsync(entity.id_usuario, entity.clave);
    if (existente != null) { throw new Error(`Ya existe la configuración '${entity.clave}' para el usuario ${entity.id_usuario}.`); }
    return await this.ConfiguracionUsuarioRepository.createAsync(entity);
  };

  updateAsync = async (entity) => { console.log(`ConfiguracionUsuarioService.updateAsync(${JSON.stringify(entity)})`); if (!entity?.id || Number.isNaN(entity.id)) { throw new Error('El id de la configuración es obligatorio para actualizar.'); } const prev = await this.ConfiguracionUsuarioRepository.getByIdAsync(entity.id); if (prev == null) return 0; return await this.ConfiguracionUsuarioRepository.updateAsync(entity); };
  deleteByIdAsync = async (id) => { console.log(`ConfiguracionUsuarioService.deleteByIdAsync(${id})`); if (!id || Number.isNaN(id)) { throw new Error('El id de la configuración es inválido.'); } return await this.ConfiguracionUsuarioRepository.deleteByIdAsync(id); };

  validarConfigParaCrear = (entity) => {
    if (!entity) throw new Error('La configuración es obligatoria.');
    if (!entity.id_usuario) throw new Error('id_usuario es obligatorio.');
    if (!entity.clave) throw new Error('clave es obligatorio.');
    if (!entity.valor) throw new Error('valor es obligatorio.');
    if (!entity.fecha_modificacion) throw new Error('fecha_modificacion es obligatorio.');
  };
}
