import ConfiguracionUsuarioRepository from '../repositories/ConfiguracionUsuarioRepository.js';
import { cacheService } from './CacheService.js';

export default class ConfiguracionUsuarioService {
  constructor() {
    console.log('Estoy en: ConfiguracionUsuarioService.constructor()');
    this.ConfiguracionUsuarioRepository = new ConfiguracionUsuarioRepository();
  }

  getAllAsync = async () => { console.log('ConfiguracionUsuarioService.getAllAsync()'); const r = await this.ConfiguracionUsuarioRepository.getAllAsync(); if (r == null) return null; return r; };
  getByIdAsync = async (id) => { console.log(`ConfiguracionUsuarioService.getByIdAsync(${id})`); if (!id || Number.isNaN(id)) { throw new Error('El id de la configuracion es invalido.'); } return await this.ConfiguracionUsuarioRepository.getByIdAsync(id); };

  getByUsuarioIdAsync = async (idUsuario) => {
    console.log(`ConfiguracionUsuarioService.getByUsuarioIdAsync(${idUsuario})`);
    if (!idUsuario || Number.isNaN(idUsuario)) { throw new Error('El id del usuario es invalido.'); }
    const cacheKey = `config.user.${idUsuario}.all`;
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;
    const configs = await this.ConfiguracionUsuarioRepository.getByUsuarioIdAsync(idUsuario);
    await cacheService.set(cacheKey, configs, 300);
    return configs;
  };

  getByUsuarioAndClaveAsync = async (idUsuario, clave) => {
    console.log(`ConfiguracionUsuarioService.getByUsuarioAndClaveAsync(${idUsuario}, ${clave})`);
    if (!idUsuario || Number.isNaN(idUsuario)) { throw new Error('El id del usuario es invalido.'); }
    if (!clave) { throw new Error('La clave es obligatoria.'); }
    const cacheKey = `config.user.${idUsuario}.${clave}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;
    const config = await this.ConfiguracionUsuarioRepository.getByUsuarioAndClaveAsync(idUsuario, clave);
    await cacheService.set(cacheKey, config, 300);
    return config;
  };

  createAsync = async (entity) => {
    console.log(`ConfiguracionUsuarioService.createAsync(${JSON.stringify(entity)})`);
    this.validarConfigParaCrear(entity);
    const existente = await this.ConfiguracionUsuarioRepository.getByUsuarioAndClaveAsync(entity.id_usuario, entity.clave);
    if (existente != null) { throw new Error(`Ya existe la configuracion '${entity.clave}' para el usuario ${entity.id_usuario}.`); }
    const newId = await this.ConfiguracionUsuarioRepository.createAsync(entity);
    await cacheService.delByPattern(`config.user.${entity.id_usuario}.*`);
    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`ConfiguracionUsuarioService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) { throw new Error('El id de la configuracion es obligatorio para actualizar.'); }
    const prev = await this.ConfiguracionUsuarioRepository.getByIdAsync(entity.id);
    if (prev == null) return 0;
    const rows = await this.ConfiguracionUsuarioRepository.updateAsync(entity);
    await cacheService.delByPattern(`config.user.${entity.id_usuario ?? prev.id_usuario}.*`);
    return rows;
  };

  deleteByIdAsync = async (id) => {
    console.log(`ConfiguracionUsuarioService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) { throw new Error('El id de la configuracion es invalido.'); }
    const prev = await this.ConfiguracionUsuarioRepository.getByIdAsync(id);
    const rows = await this.ConfiguracionUsuarioRepository.deleteByIdAsync(id);
    if (prev) {
      await cacheService.delByPattern(`config.user.${prev.id_usuario}.*`);
    }
    return rows;
  };

  validarConfigParaCrear = (entity) => {
    if (!entity) throw new Error('La configuracion es obligatoria.');
    if (!entity.id_usuario) throw new Error('id_usuario es obligatorio.');
    if (!entity.clave) throw new Error('clave es obligatorio.');
    if (!entity.valor) throw new Error('valor es obligatorio.');
    if (!entity.fecha_modificacion) throw new Error('fecha_modificacion es obligatorio.');
  };
}
