import ReporteUsuarioRepository from '../repositories/ReporteUsuarioRepository.js';

export default class ReporteUsuarioService {
  constructor() {
    console.log('Estoy en: ReporteUsuarioService.constructor()');
    this.ReporteUsuarioRepository = new ReporteUsuarioRepository();
  }

  getAllAsync = async () => { console.log('ReporteUsuarioService.getAllAsync()'); const r = await this.ReporteUsuarioRepository.getAllAsync(); if (r == null) return null; return r; };
  getByIdAsync = async (id) => { console.log(`ReporteUsuarioService.getByIdAsync(${id})`); if (!id || Number.isNaN(id)) { throw new Error('El id del reporte es inválido.'); } return await this.ReporteUsuarioRepository.getByIdAsync(id); };
  createAsync = async (entity) => { console.log(`ReporteUsuarioService.createAsync(${JSON.stringify(entity)})`); this.validarReporteParaCrear(entity); return await this.ReporteUsuarioRepository.createAsync(entity); };
  updateAsync = async (entity) => { console.log(`ReporteUsuarioService.updateAsync(${JSON.stringify(entity)})`); if (!entity?.id || Number.isNaN(entity.id)) { throw new Error('El id del reporte es obligatorio para actualizar.'); } const prev = await this.ReporteUsuarioRepository.getByIdAsync(entity.id); if (prev == null) return 0; return await this.ReporteUsuarioRepository.updateAsync(entity); };
  deleteByIdAsync = async (id) => { console.log(`ReporteUsuarioService.deleteByIdAsync(${id})`); if (!id || Number.isNaN(id)) { throw new Error('El id del reporte es inválido.'); } return await this.ReporteUsuarioRepository.deleteByIdAsync(id); };

  validarReporteParaCrear = (entity) => {
    if (!entity) throw new Error('El reporte es obligatorio.');
    if (!entity.id_usuario_reportante) throw new Error('id_usuario_reportante es obligatorio.');
    if (!entity.id_estado_reporte) throw new Error('id_estado_reporte es obligatorio.');
    if (!entity.motivo) throw new Error('motivo es obligatorio.');
    if (!entity.fecha_reporte) throw new Error('fecha_reporte es obligatorio.');
  };
}
