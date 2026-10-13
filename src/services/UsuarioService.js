import UsuarioRepository from '../repositories/UsuarioRepository.js';
import AppError from '../modules/errors/AppError.js';
import { toPublicUser } from '../modules/security/account-update.policy.js';
import { buildCacheKey, getOrSetCache } from '../cache/cacheHelper.js';
import { CACHE_TAGS, CACHE_TTL, invalidateUserCaches } from '../cache/cacheTags.js';

function stripHash(usuario) {
  if (!usuario) return usuario;
  const { contrasena_hash, ...safe } = usuario;
  return safe;
}

export default class UsuarioService {
  constructor() {
    console.log('Estoy en: UsuarioService.constructor()');
    this.UsuarioRepository = new UsuarioRepository();
  }

  getAllAsync = async () => {
    console.log('UsuarioService.getAllAsync()');

    const returnArray = await this.UsuarioRepository.getAllAsync();

    if (returnArray == null) return null;

    return returnArray;
  };

  /**
   * Lista de usuarios tal como la ve `idSolicitante`: admin sin hash, el resto
   * solo campos publicos. Se cachea ya filtrada (nunca con contrasena_hash) y
   * con el id del solicitante en la clave.
   */
  getAllForRequesterAsync = async (idSolicitante, isAdmin) => {
    const key = buildCacheKey('usuarios', { userId: idSolicitante, params: { admin: Boolean(isAdmin) } });
    return await getOrSetCache(key, CACHE_TTL.PERSONAL_LIST, async () => {
      const returnArray = await this.getAllAsync();
      if (returnArray == null) return null;
      return returnArray.map(isAdmin ? stripHash : toPublicUser);
    }, { tags: [CACHE_TAGS.USUARIOS] });
  };

  getByIdAsync = async (id) => {
    console.log(`UsuarioService.getByIdAsync(${id})`);

    if (!id || Number.isNaN(id)) {
      throw new Error('El id del usuario es invalido.');
    }

    const returnEntity = await this.UsuarioRepository.getByIdAsync(id);

    return returnEntity;
  };

  createAsync = async (entity) => {
    console.log(`UsuarioService.createAsync(${JSON.stringify(entity)})`);

    if (entity?.nombre_usuario) entity.nombre_usuario = String(entity.nombre_usuario).trim();
    if (entity?.correo) entity.correo = String(entity.correo).trim();

    this.validarUsuarioParaCrear(entity);

    const usuarioConMismoCorreo = await this.UsuarioRepository.getByCorreoAsync(entity.correo);

    if (usuarioConMismoCorreo != null) {
      throw new AppError(`Ya existe un usuario con el correo ${entity.correo}.`, 409);
    }

    const usuarioConMismoNombreUsuario = await this.UsuarioRepository.getByNombreUsuarioAsync(entity.nombre_usuario);

    if (usuarioConMismoNombreUsuario != null) {
      throw new AppError(`Ya existe un usuario con el nombre de usuario ${entity.nombre_usuario}.`, 409);
    }

    const newId = await this.UsuarioRepository.createAsync(entity);
    await invalidateUserCaches(newId);

    return newId;
  };

  updateAsync = async (entity) => {
    console.log(`UsuarioService.updateAsync(${JSON.stringify(entity)})`);

    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id del usuario es obligatorio para actualizar.');
    }

    const previousEntity = await this.UsuarioRepository.getByIdAsync(entity.id);

    if (previousEntity == null) {
      return 0;
    }

    if (entity?.nombre_usuario) entity.nombre_usuario = String(entity.nombre_usuario).trim();
    if (entity?.correo) entity.correo = String(entity.correo).trim();

    if (entity.correo && entity.correo.toLowerCase() !== String(previousEntity.correo || '').toLowerCase()) {
      const usuarioConMismoCorreo = await this.UsuarioRepository.getByCorreoAsync(entity.correo);

      if (usuarioConMismoCorreo != null) {
        throw new AppError(`Ya existe un usuario con el correo ${entity.correo}.`, 409);
      }
    }

    if (entity.nombre_usuario && entity.nombre_usuario.toLowerCase() !== String(previousEntity.nombre_usuario || '').toLowerCase()) {
      const usuarioConMismoNombreUsuario = await this.UsuarioRepository.getByNombreUsuarioAsync(entity.nombre_usuario);

      if (usuarioConMismoNombreUsuario != null) {
        throw new AppError(`Ya existe un usuario con el nombre de usuario ${entity.nombre_usuario}.`, 409);
      }
    }

    const rowsAffected = await this.UsuarioRepository.updateAsync(entity);
    await invalidateUserCaches(entity.id);

    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`UsuarioService.deleteByIdAsync(${id})`);

    if (!id || Number.isNaN(id)) {
      throw new Error('El id del usuario es invalido.');
    }

    const rowsAffected = await this.UsuarioRepository.deleteByIdAsync(id);
    await invalidateUserCaches(id);

    return rowsAffected;
  };

  validarUsuarioParaCrear = (entity) => {
    if (!entity) {
      throw new Error('El usuario es obligatorio.');
    }

    if (!entity.id_tipo_usuario) {
      throw new Error('id_tipo_usuario es obligatorio.');
    }

    if (!entity.nombre_usuario) {
      throw new Error('nombre_usuario es obligatorio.');
    }

    if (!entity.contrasena_hash) {
      throw new Error('contrasena_hash es obligatorio.');
    }

    if (!entity.nombre) {
      throw new Error('nombre es obligatorio.');
    }

    if (!entity.apellido) {
      throw new Error('apellido es obligatorio.');
    }

    if (!entity.correo) {
      throw new Error('correo es obligatorio.');
    }

    if (!entity.fecha_ingreso) {
      throw new Error('fecha_ingreso es obligatorio.');
    }
  };
}
