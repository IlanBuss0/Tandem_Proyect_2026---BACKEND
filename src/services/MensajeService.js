import MensajeRepository from '../repositories/MensajeRepository.js';

export default class MensajeService {
  constructor() {
    console.log('Estoy en: MensajeService.constructor()');
    this.MensajeRepository = new MensajeRepository();
  }

  getAllAsync = async () => { console.log('MensajeService.getAllAsync()'); const r = await this.MensajeRepository.getAllAsync(); if (r == null) return null; return r; };
  getByIdAsync = async (id) => { console.log(`MensajeService.getByIdAsync(${id})`); if (!id || Number.isNaN(id)) { throw new Error('El id del mensaje es invalido.'); } return await this.MensajeRepository.getByIdAsync(id); };
  createAsync = async (entity) => { console.log(`MensajeService.createAsync(${JSON.stringify(entity)})`); this.validarMensajeParaCrear(entity); return await this.MensajeRepository.createAsync(entity); };
  updateAsync = async (entity) => { console.log(`MensajeService.updateAsync(${JSON.stringify(entity)})`); if (!entity?.id || Number.isNaN(entity.id)) { throw new Error('El id del mensaje es obligatorio para actualizar.'); } const prev = await this.MensajeRepository.getByIdAsync(entity.id); if (prev == null) return 0; return await this.MensajeRepository.updateAsync(entity); };
  deleteByIdAsync = async (id) => { console.log(`MensajeService.deleteByIdAsync(${id})`); if (!id || Number.isNaN(id)) { throw new Error('El id del mensaje es invalido.'); } return await this.MensajeRepository.deleteByIdAsync(id); };

  validarMensajeParaCrear = (entity) => {
    if (!entity) throw new Error('El mensaje es obligatorio.');
    if (!entity.id_chat) throw new Error('id_chat es obligatorio.');
    if (!entity.id_usuario_emisor) throw new Error('id_usuario_emisor es obligatorio.');
    if (!entity.id_tipo_mensaje) throw new Error('id_tipo_mensaje es obligatorio.');
    if (!entity.fecha_envio) throw new Error('fecha_envio es obligatorio.');
  };
}
