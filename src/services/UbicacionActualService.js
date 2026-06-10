import UbicacionActualRepository from '../repositories/UbicacionActualRepository.js';

export default class UbicacionActualService {
  constructor() {
    console.log('Estoy en: UbicacionActualService.constructor()');
    this.UbicacionActualRepository = new UbicacionActualRepository();
  }

  getAllAsync = async () => { console.log('UbicacionActualService.getAllAsync()'); const r = await this.UbicacionActualRepository.getAllAsync(); if (r == null) return null; return r; };

  getByIdAsync = async (id) => { console.log(`UbicacionActualService.getByIdAsync(${id})`); if (!id || Number.isNaN(id)) { throw new Error('El id de la ubicacion actual es invalido.'); } return await this.UbicacionActualRepository.getByIdAsync(id); };

  getByDispositivoIdAsync = async (idDispositivo) => { console.log(`UbicacionActualService.getByDispositivoIdAsync(${idDispositivo})`); if (!idDispositivo || Number.isNaN(idDispositivo)) { throw new Error('El id del dispositivo es invalido.'); } return await this.UbicacionActualRepository.getByDispositivoIdAsync(idDispositivo); };

  createAsync = async (entity) => {
    console.log(`UbicacionActualService.createAsync(${JSON.stringify(entity)})`);
    this.validarUbicacionParaCrear(entity);
    const existente = await this.UbicacionActualRepository.getByDispositivoIdAsync(entity.id_dispositivo);
    if (existente != null) { throw new Error(`Ya existe una ubicacion actual para el dispositivo con id ${entity.id_dispositivo}.`); }
    return await this.UbicacionActualRepository.createAsync(entity);
  };

  updateAsync = async (entity) => { console.log(`UbicacionActualService.updateAsync(${JSON.stringify(entity)})`); if (!entity?.id || Number.isNaN(entity.id)) { throw new Error('El id de la ubicacion actual es obligatorio para actualizar.'); } const prev = await this.UbicacionActualRepository.getByIdAsync(entity.id); if (prev == null) return 0; return await this.UbicacionActualRepository.updateAsync(entity); };

  deleteByIdAsync = async (id) => { console.log(`UbicacionActualService.deleteByIdAsync(${id})`); if (!id || Number.isNaN(id)) { throw new Error('El id de la ubicacion actual es invalido.'); } return await this.UbicacionActualRepository.deleteByIdAsync(id); };

  validarUbicacionParaCrear = (entity) => {
    if (!entity) throw new Error('La ubicacion actual es obligatoria.');
    if (!entity.id_dispositivo) throw new Error('id_dispositivo es obligatorio.');
    if (!entity.latitud) throw new Error('latitud es obligatorio.');
    if (!entity.longitud) throw new Error('longitud es obligatorio.');
    if (!entity.fecha_registro) throw new Error('fecha_registro es obligatorio.');
  };
}
