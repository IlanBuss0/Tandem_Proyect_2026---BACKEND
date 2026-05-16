import DispositivoRepository from '../repositories/DispositivoRepository.js';

export default class DispositivoService {
  constructor() {
    console.log('Estoy en: DispositivoService.constructor()');
    this.DispositivoRepository = new DispositivoRepository();
  }

  getAllAsync = async () => { console.log('DispositivoService.getAllAsync()'); const r = await this.DispositivoRepository.getAllAsync(); if (r == null) return null; return r; };

  getByIdAsync = async (id) => { console.log(`DispositivoService.getByIdAsync(${id})`); if (!id || Number.isNaN(id)) { throw new Error('El id del dispositivo es inválido.'); } return await this.DispositivoRepository.getByIdAsync(id); };

  createAsync = async (entity) => { console.log(`DispositivoService.createAsync(${JSON.stringify(entity)})`); this.validarDispositivoParaCrear(entity); return await this.DispositivoRepository.createAsync(entity); };

  updateAsync = async (entity) => { console.log(`DispositivoService.updateAsync(${JSON.stringify(entity)})`); if (!entity?.id || Number.isNaN(entity.id)) { throw new Error('El id del dispositivo es obligatorio para actualizar.'); } const prev = await this.DispositivoRepository.getByIdAsync(entity.id); if (prev == null) return 0; return await this.DispositivoRepository.updateAsync(entity); };

  deleteByIdAsync = async (id) => { console.log(`DispositivoService.deleteByIdAsync(${id})`); if (!id || Number.isNaN(id)) { throw new Error('El id del dispositivo es inválido.'); } return await this.DispositivoRepository.deleteByIdAsync(id); };

  validarDispositivoParaCrear = (entity) => {
    if (!entity) throw new Error('El dispositivo es obligatorio.');
    if (!entity.id_usuario) throw new Error('id_usuario es obligatorio.');
    if (!entity.fecha_alta) throw new Error('fecha_alta es obligatorio.');
  };
}
