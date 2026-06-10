import AppError from '../modules/errors/AppError.js';
import PermisoRepository from '../repositories/PermisoRepository.js';
import AuthorizationService from './AuthorizationService.js';

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

  async setPertenecientePermissionByName(idPerteneciente, body, idUsuarioModificador) {
    const payload = this.validateSetPermissionPayload(body);
    const catalogo = await PermisoRepository.findCatalogoPertenecienteByNombre(payload.permiso);
    if (!catalogo) throw new AppError(`Permiso de perteneciente no encontrado: ${payload.permiso}`, 400);

    const effectiveBefore = await AuthorizationService.getEffectivePertenecientePermissions(idPerteneciente);
    this.assertManagedEffectivePermission(effectiveBefore.permisos, catalogo.nombre);
    const previousValue = effectiveBefore.permisos[catalogo.nombre].habilitado;

    const result = await PermisoRepository.setPertenecientePermissionByName({
      idPerteneciente,
      nombrePermiso: catalogo.nombre,
      habilitado: payload.habilitado,
      idUsuarioModificador,
      motivo: payload.motivo,
      habilitadoAnterior: previousValue ?? null,
      shouldInsertHistorial: previousValue !== payload.habilitado,
    });

    const effectiveAfter = await AuthorizationService.getEffectivePertenecientePermissions(idPerteneciente);
    return {
      ...effectiveAfter,
      permiso_actualizado: {
        nombre: result.catalogo.nombre,
        habilitado: result.permiso.habilitado,
        historial_creado: Boolean(result.historial),
      },
    };
  }

  createProfesional(body) {
    return PermisoRepository.createProfesional(body);
  }

  async setProfesionalPermissionByName(idVinculo, body, idUsuarioModificador) {
    const payload = this.validateSetPermissionPayload(body);
    const catalogo = await PermisoRepository.findCatalogoProfesionalByNombre(payload.permiso);
    if (!catalogo) throw new AppError(`Permiso profesional no encontrado: ${payload.permiso}`, 400);

    const effectiveBefore = await AuthorizationService.getEffectiveProfesionalPermissions(idVinculo);
    this.assertManagedEffectivePermission(effectiveBefore.permisos, catalogo.nombre);
    const previousValue = effectiveBefore.permisos[catalogo.nombre].habilitado;

    const result = await PermisoRepository.setProfesionalPermissionByName({
      idVinculo,
      nombrePermiso: catalogo.nombre,
      habilitado: payload.habilitado,
      idUsuarioModificador,
      motivo: payload.motivo,
      habilitadoAnterior: previousValue ?? null,
      shouldInsertHistorial: previousValue !== payload.habilitado,
    });

    const effectiveAfter = await AuthorizationService.getEffectiveProfesionalPermissions(idVinculo);
    return {
      ...effectiveAfter,
      permiso_actualizado: {
        nombre: result.catalogo.nombre,
        habilitado: result.permiso.habilitado,
        historial_creado: Boolean(result.historial),
      },
    };
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

  validateSetPermissionPayload(body) {
    const permiso = typeof body?.permiso === 'string' ? body.permiso.trim() : '';

    if (!permiso) {
      throw new AppError('permiso es obligatorio.', 400);
    }

    if (typeof body?.habilitado !== 'boolean') {
      throw new AppError('habilitado debe ser boolean.', 400);
    }

    return {
      permiso,
      habilitado: body.habilitado,
      motivo: typeof body?.motivo === 'string' && body.motivo.trim() ? body.motivo.trim() : null,
    };
  }

  assertManagedEffectivePermission(permisos, nombrePermiso) {
    if (!Object.prototype.hasOwnProperty.call(permisos, nombrePermiso)) {
      throw new AppError(`Permiso no gestionable en este endpoint: ${nombrePermiso}`, 400);
    }
  }
}

export default new PermisoService();
