import ConfiguracionAccesibilidadRepository from '../repositories/ConfiguracionAccesibilidadRepository.js';

export default class ConfiguracionAccesibilidadService {
  constructor() {
    console.log('Estoy en: ConfiguracionAccesibilidadService.constructor()');
    this.ConfiguracionAccesibilidadRepository = new ConfiguracionAccesibilidadRepository();
  }

  getAllAsync = async () => { console.log('ConfiguracionAccesibilidadService.getAllAsync()'); const r = await this.ConfiguracionAccesibilidadRepository.getAllAsync(); if (r == null) return null; return r; };
  getByIdAsync = async (id) => { console.log(`ConfiguracionAccesibilidadService.getByIdAsync(${id})`); if (!id || Number.isNaN(id)) { throw new Error('El id de la configuración de accesibilidad es inválido.'); } return await this.ConfiguracionAccesibilidadRepository.getByIdAsync(id); };

  createAsync = async (entity) => {
    console.log(`ConfiguracionAccesibilidadService.createAsync(${JSON.stringify(entity)})`);
    this.validarConfigParaCrear(entity);
    const existente = await this.ConfiguracionAccesibilidadRepository.getByUsuarioAndClaveAsync(entity.id_usuario, entity.clave);
    if (existente != null) { throw new Error(`Ya existe la configuración de accesibilidad '${entity.clave}' para el usuario ${entity.id_usuario}.`); }
    return await this.ConfiguracionAccesibilidadRepository.createAsync(entity);
  };

  updateAsync = async (entity) => { console.log(`ConfiguracionAccesibilidadService.updateAsync(${JSON.stringify(entity)})`); if (!entity?.id || Number.isNaN(entity.id)) { throw new Error('El id de la configuración de accesibilidad es obligatorio para actualizar.'); } const prev = await this.ConfiguracionAccesibilidadRepository.getByIdAsync(entity.id); if (prev == null) return 0; return await this.ConfiguracionAccesibilidadRepository.updateAsync(entity); };
  deleteByIdAsync = async (id) => { console.log(`ConfiguracionAccesibilidadService.deleteByIdAsync(${id})`); if (!id || Number.isNaN(id)) { throw new Error('El id de la configuración de accesibilidad es inválido.'); } return await this.ConfiguracionAccesibilidadRepository.deleteByIdAsync(id); };

  validarConfigParaCrear = (entity) => {
    if (!entity) throw new Error('La configuración de accesibilidad es obligatoria.');
    if (!entity.id_usuario) throw new Error('id_usuario es obligatorio.');
    if (!entity.clave) throw new Error('clave es obligatorio.');
    if (!entity.valor) throw new Error('valor es obligatorio.');
    if (!entity.fecha_modificacion) throw new Error('fecha_modificacion es obligatorio.');
  };
}
