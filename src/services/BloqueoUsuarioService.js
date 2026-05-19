import BloqueoUsuarioRepository from '../repositories/BloqueoUsuarioRepository.js';

export default class BloqueoUsuarioService {
  constructor() {
    console.log('Estoy en: BloqueoUsuarioService.constructor()');
    this.BloqueoUsuarioRepository = new BloqueoUsuarioRepository();
  }

  getAllAsync = async () => { console.log('BloqueoUsuarioService.getAllAsync()'); const r = await this.BloqueoUsuarioRepository.getAllAsync(); if (r == null) return null; return r; };
  getByIdAsync = async (id) => { console.log(`BloqueoUsuarioService.getByIdAsync(${id})`); if (!id || Number.isNaN(id)) { throw new Error('El id del bloqueo es invalido.'); } return await this.BloqueoUsuarioRepository.getByIdAsync(id); };

  createAsync = async (entity) => {
    console.log(`BloqueoUsuarioService.createAsync(${JSON.stringify(entity)})`);
    this.validarBloqueoParaCrear(entity);
    const existente = await this.BloqueoUsuarioRepository.getByParejaAsync(entity.id_usuario_bloqueador, entity.id_usuario_bloqueado);
    if (existente != null) { throw new Error(`El usuario ${entity.id_usuario_bloqueador} ya tiene bloqueado al usuario ${entity.id_usuario_bloqueado}.`); }
    return await this.BloqueoUsuarioRepository.createAsync(entity);
  };

  updateAsync = async (entity) => { console.log(`BloqueoUsuarioService.updateAsync(${JSON.stringify(entity)})`); if (!entity?.id || Number.isNaN(entity.id)) { throw new Error('El id del bloqueo es obligatorio para actualizar.'); } const prev = await this.BloqueoUsuarioRepository.getByIdAsync(entity.id); if (prev == null) return 0; return await this.BloqueoUsuarioRepository.updateAsync(entity); };
  deleteByIdAsync = async (id) => { console.log(`BloqueoUsuarioService.deleteByIdAsync(${id})`); if (!id || Number.isNaN(id)) { throw new Error('El id del bloqueo es invalido.'); } return await this.BloqueoUsuarioRepository.deleteByIdAsync(id); };

  validarBloqueoParaCrear = (entity) => {
    if (!entity) throw new Error('El bloqueo es obligatorio.');
    if (!entity.id_usuario_bloqueador) throw new Error('id_usuario_bloqueador es obligatorio.');
    if (!entity.id_usuario_bloqueado) throw new Error('id_usuario_bloqueado es obligatorio.');
    if (entity.id_usuario_bloqueador === entity.id_usuario_bloqueado) throw new Error('Un usuario no puede bloquearse a si mismo.');
    if (!entity.fecha_bloqueo) throw new Error('fecha_bloqueo es obligatorio.');
  };
}
