import AppError from '../modules/errors/AppError.js';
import PermisoRepository from '../repositories/PermisoRepository.js';

class PermisoService {
  listPertenecientes() { return PermisoRepository.findAllPertenecientes(); }
  listProfesionales() { return PermisoRepository.findAllProfesionales(); }
  getByPerteneciente(id) { return PermisoRepository.findByPerteneciente(id); }
  getByProfesional(id) { return PermisoRepository.findByProfesional(id); }

  createPerteneciente(body) { return PermisoRepository.createPerteneciente(body); }
  createProfesional(body) { return PermisoRepository.createProfesional(body); }
  createPerteneciente(body) { return PermisoRepository.create({ ...body, tipo_permiso: 'perteneciente' }); }
  createProfesional(body) { return PermisoRepository.create({ ...body, tipo_permiso: 'profesional' }); }

  async update(id, body) {
    const row = await PermisoRepository.update(id, body);
    if (!row) throw new AppError('Permiso no encontrado', 404);
    return row;
  }

  async remove(id) {
    const ok = await PermisoRepository.remove(id);
    if (!ok) throw new AppError('Permiso no encontrado', 404);
    const count = await PermisoRepository.remove(id);
    if (!count) throw new AppError('Permiso no encontrado', 404);
  }
}

export default new PermisoService();
