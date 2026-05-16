import ContactoRepository from '../repositories/ContactoRepository.js';

export default class ContactoService {
  constructor() {
    console.log('Estoy en: ContactoService.constructor()');
    this.ContactoRepository = new ContactoRepository();
  }

  getAllAsync = async () => { console.log('ContactoService.getAllAsync()'); const r = await this.ContactoRepository.getAllAsync(); if (r == null) return null; return r; };

  getByIdAsync = async (id) => { console.log(`ContactoService.getByIdAsync(${id})`); if (!id || Number.isNaN(id)) { throw new Error('El id del contacto es inválido.'); } return await this.ContactoRepository.getByIdAsync(id); };

  createAsync = async (entity) => {
    console.log(`ContactoService.createAsync(${JSON.stringify(entity)})`);
    this.validarContactoParaCrear(entity);
    const existente = await this.ContactoRepository.getByParejaNormalizadaAsync(entity.id_usuario_menor, entity.id_usuario_mayor);
    if (existente != null) { throw new Error(`Ya existe un contacto entre los usuarios ${entity.id_usuario_menor} y ${entity.id_usuario_mayor}.`); }
    return await this.ContactoRepository.createAsync(entity);
  };

  updateAsync = async (entity) => { console.log(`ContactoService.updateAsync(${JSON.stringify(entity)})`); if (!entity?.id || Number.isNaN(entity.id)) { throw new Error('El id del contacto es obligatorio para actualizar.'); } const prev = await this.ContactoRepository.getByIdAsync(entity.id); if (prev == null) return 0; return await this.ContactoRepository.updateAsync(entity); };

  deleteByIdAsync = async (id) => { console.log(`ContactoService.deleteByIdAsync(${id})`); if (!id || Number.isNaN(id)) { throw new Error('El id del contacto es inválido.'); } return await this.ContactoRepository.deleteByIdAsync(id); };

  validarContactoParaCrear = (entity) => {
    if (!entity) throw new Error('El contacto es obligatorio.');
    if (!entity.id_usuario_menor) throw new Error('id_usuario_menor es obligatorio.');
    if (!entity.id_usuario_mayor) throw new Error('id_usuario_mayor es obligatorio.');
    if (entity.id_usuario_menor >= entity.id_usuario_mayor) throw new Error('id_usuario_menor debe ser menor que id_usuario_mayor.');
    if (!entity.id_usuario_solicitante) throw new Error('id_usuario_solicitante es obligatorio.');
    if (!entity.id_estado_contacto) throw new Error('id_estado_contacto es obligatorio.');
    if (!entity.fecha_solicitud) throw new Error('fecha_solicitud es obligatorio.');
  };
}
