import UbicacionHistorialRepository from '../repositories/UbicacionHistorialRepository.js';

export default class UbicacionHistorialService {
  constructor() {
    console.log('Estoy en: UbicacionHistorialService.constructor()');
    this.UbicacionHistorialRepository = new UbicacionHistorialRepository();
  }

  getAllAsync = async () => { console.log('UbicacionHistorialService.getAllAsync()'); const r = await this.UbicacionHistorialRepository.getAllAsync(); if (r == null) return null; return r; };

  getByIdAsync = async (id) => { console.log(`UbicacionHistorialService.getByIdAsync(${id})`); if (!id || Number.isNaN(id)) { throw new Error('El id del historial de ubicacion es invalido.'); } return await this.UbicacionHistorialRepository.getByIdAsync(id); };

  getByDispositivoIdAsync = async (idDispositivo) => { console.log(`UbicacionHistorialService.getByDispositivoIdAsync(${idDispositivo})`); if (!idDispositivo || Number.isNaN(idDispositivo)) { throw new Error('El id del dispositivo es invalido.'); } return await this.UbicacionHistorialRepository.getByDispositivoIdAsync(idDispositivo); };

  createAsync = async (entity) => { console.log(`UbicacionHistorialService.createAsync(${JSON.stringify(entity)})`); this.validarUbicacionParaCrear(entity); return await this.UbicacionHistorialRepository.createAsync(entity); };

  updateAsync = async (entity) => { console.log(`UbicacionHistorialService.updateAsync(${JSON.stringify(entity)})`); if (!entity?.id || Number.isNaN(entity.id)) { throw new Error('El id del historial es obligatorio para actualizar.'); } const prev = await this.UbicacionHistorialRepository.getByIdAsync(entity.id); if (prev == null) return 0; return await this.UbicacionHistorialRepository.updateAsync(entity); };

  deleteByIdAsync = async (id) => { console.log(`UbicacionHistorialService.deleteByIdAsync(${id})`); if (!id || Number.isNaN(id)) { throw new Error('El id del historial es invalido.'); } return await this.UbicacionHistorialRepository.deleteByIdAsync(id); };

  validarUbicacionParaCrear = (entity) => {
    if (!entity) throw new Error('El historial de ubicacion es obligatorio.');
    if (!entity.id_dispositivo) throw new Error('id_dispositivo es obligatorio.');
    if (!entity.latitud) throw new Error('latitud es obligatorio.');
    if (!entity.longitud) throw new Error('longitud es obligatorio.');
    if (!entity.fecha_registro) throw new Error('fecha_registro es obligatorio.');
  };
}
