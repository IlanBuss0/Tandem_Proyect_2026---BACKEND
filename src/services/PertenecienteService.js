import PertenecienteRepository from '../repositories/PertenecienteRepository.js';
import AuthorizationService from './AuthorizationService.js';
import { PROFESIONAL_PERMISSIONS } from '../modules/security/permissions.constants.js';
import { buildCacheKey, getOrSetCache } from '../cache/cacheHelper.js';
import { CACHE_TAGS, CACHE_TTL } from '../cache/cacheTags.js';

export default class PertenecienteService {
  constructor() {
    console.log('Estoy en: PertenecienteService.constructor()');
    this.PertenecienteRepository = new PertenecienteRepository();
  }

  getAllAsync = async () => {
    console.log('PertenecienteService.getAllAsync()');
    const returnArray = await this.PertenecienteRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  /**
   * GET /api/pertenecientes: los perfiles que `idUsuario` puede leer (admin:
   * todos; resto: propio, tutor con vinculo activo o profesional con
   * VER_HISTORIAL). Antes se resolvian los permisos uno por uno (varias
   * consultas por cada perteneciente de la base); ahora en lote, y el
   * resultado ya filtrado se cachea con el usuario en la clave.
   */
  getVisibleForUserAsync = async (idUsuario, { isAdmin = false } = {}) => {
    const key = buildCacheKey('pertenecientes', { userId: idUsuario, params: { admin: Boolean(isAdmin) } });
    return await getOrSetCache(key, CACHE_TTL.PERSONAL_LIST, async () => {
      const returnArray = await this.getAllAsync();
      if (returnArray == null) return null;
      if (isAdmin) return returnArray;
      const readable = await AuthorizationService.filterReadablePertenecienteIds(
        idUsuario,
        returnArray.map((item) => item.id),
        PROFESIONAL_PERMISSIONS.VER_HISTORIAL,
      );
      return returnArray.filter((item) => readable.has(Number(item.id)));
    }, { tags: [CACHE_TAGS.PERTENECIENTES, CACHE_TAGS.AUTHZ] });
  };

  getByIdAsync = async (id) => {
    console.log(`PertenecienteService.getByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id del perteneciente es invalido.');
    }
    const returnEntity = await this.PertenecienteRepository.getByIdAsync(id);
    return returnEntity;
  };

  getByUsuarioIdAsync = async (idUsuario) => {
    console.log(`PertenecienteService.getByUsuarioIdAsync(${idUsuario})`);
    if (!idUsuario || Number.isNaN(idUsuario)) {
      throw new Error('El id del usuario es invalido.');
    }
    return await this.PertenecienteRepository.getByUsuarioIdAsync(idUsuario);
  };

  createAsync = async (entity) => {
    console.log(`PertenecienteService.createAsync(${JSON.stringify(entity)})`);
    this.validarPertenecienteParaCrear(entity);
    const pertenecienteConMismoUsuario = await this.PertenecienteRepository.getByUsuarioIdAsync(entity.id_usuario);
    if (pertenecienteConMismoUsuario != null) {
      throw new Error(`Ya existe un perteneciente asociado al usuario con id ${entity.id_usuario}.`);
    }
    const newId = await this.PertenecienteRepository.createAsync(entity);
    await this.invalidateCachesAsync(entity.id_usuario);
    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`PertenecienteService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id del perteneciente es obligatorio para actualizar.');
    }
    const previousEntity = await this.PertenecienteRepository.getByIdAsync(entity.id);
    if (previousEntity == null) return 0;
    if (entity.id_usuario && entity.id_usuario !== previousEntity.id_usuario) {
      const pertenecienteConMismoUsuario = await this.PertenecienteRepository.getByUsuarioIdAsync(entity.id_usuario);
      if (pertenecienteConMismoUsuario != null) {
        throw new Error(`Ya existe un perteneciente asociado al usuario con id ${entity.id_usuario}.`);
      }
    }
    const rowsAffected = await this.PertenecienteRepository.updateAsync(entity);
    // puede_autogestionarse cambia el modo de permisos y el contexto del usuario.
    await AuthorizationService.invalidatePertenecientePermissions(entity.id);
    await this.invalidateCachesAsync(previousEntity.id_usuario);
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`PertenecienteService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id del perteneciente es invalido.');
    }
    const previousEntity = await this.PertenecienteRepository.getByIdAsync(id);
    const rowsAffected = await this.PertenecienteRepository.deleteByIdAsync(id);
    await AuthorizationService.invalidatePertenecientePermissions(id);
    await this.invalidateCachesAsync(previousEntity?.id_usuario);
    return rowsAffected;
  };

  invalidateCachesAsync = async (idUsuario) => {
    if (idUsuario != null) await AuthorizationService.invalidateUserContext(idUsuario);
    else await AuthorizationService.invalidateUserContext();
  };

  validarPertenecienteParaCrear = (entity) => {
    if (!entity) throw new Error('El perteneciente es obligatorio.');
    if (!entity.id_usuario) throw new Error('id_usuario es obligatorio.');
    if (!entity.id_nivel_apoyo) throw new Error('id_nivel_apoyo es obligatorio.');
    if (!entity.id_autonomia_operativa) throw new Error('id_autonomia_operativa es obligatorio.');
  };
}
