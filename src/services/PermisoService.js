import AppError from '../modules/errors/AppError.js';
import PermisoRepository from '../repositories/PermisoRepository.js';

class PermisoService {
  listPertenecientes() {
    return PermisoRepository.findAllPertenecientes();
  }

  listProfesionales() {
    return PermisoRepository.findAllProfesionales();
  }

  getByPerteneciente(id) {
    return PermisoRepository.findByPerteneciente(id);
  }

  getByProfesional(id) {
    return PermisoRepository.findByProfesional(id);
  }

  getPertenecientePermissionById(id) {
    return PermisoRepository.findPertenecientePermissionById(id);
  }

  getProfesionalPermissionById(id) {
    return PermisoRepository.findProfesionalPermissionById(id);
  }

  createPerteneciente(body) {
    return PermisoRepository.createPerteneciente(body);
  }

  createProfesional(body) {
    return PermisoRepository.createProfesional(body);
  }

  async updatePerteneciente(id, body) {
    const row = await PermisoRepository.updatePerteneciente(id, body);
    if (!row) throw new AppError('Permiso no encontrado', 404);
    return row;
  }

  async updateProfesional(id, body) {
    const row = await PermisoRepository.updateProfesional(id, body);
    if (!row) throw new AppError('Permiso no encontrado', 404);
    return row;
  }

  async removePerteneciente(id) {
    const ok = await PermisoRepository.removePerteneciente(id);
    if (!ok) throw new AppError('Permiso no encontrado', 404);
  }

  async removeProfesional(id) {
    const ok = await PermisoRepository.removeProfesional(id);
    if (!ok) throw new AppError('Permiso no encontrado', 404);
  }
}

export default new PermisoService();
