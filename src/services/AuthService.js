import AppError from '../modules/errors/AppError.js';
import AuthRepository from '../repositories/AuthRepository.js';
import RefreshTokenRepository from '../repositories/RefreshTokenRepository.js';
import UsuarioServiceClass from './UsuarioService.js';
import { compareValue, hashValue, shouldRehashValue } from '../modules/security/hash.helper.js';
import { getJwtExpiresAt, signJwt } from '../modules/security/jwt.helper.js';
import {
  createSessionFamilyId,
  generateRefreshToken,
  getRefreshExpiresAt,
  hashRefreshToken,
} from '../modules/security/refresh-token.helper.js';

const UsuarioService = new UsuarioServiceClass();

class AuthService {
  async createSession(user, familyId = createSessionFamilyId()) {
    const accessToken = signJwt({ id: user.id, correo: user.correo, nombre_usuario: user.nombre_usuario });
    const refreshToken = generateRefreshToken();
    const refreshTokenHash = hashRefreshToken(refreshToken);
    const refreshExpiresAt = getRefreshExpiresAt();

    await RefreshTokenRepository.create({
      idUsuario: user.id,
      tokenHash: refreshTokenHash,
      familyId,
      expiresAt: refreshExpiresAt,
    });

    return {
      user,
      token: accessToken,
      accessToken,
      expiresAt: getJwtExpiresAt(),
      refreshToken,
      refreshExpiresAt: refreshExpiresAt.toISOString(),
    };
  }

  async register(data) {
    const entity = { ...data };

    if (!entity.contrasena_hash && entity.contrasena) {
      entity.contrasena_hash = await hashValue(entity.contrasena);
    }

    if (!entity.fecha_ingreso) {
      entity.fecha_ingreso = new Date();
    }

    const newId = await UsuarioService.createAsync(entity);
    const user = await AuthRepository.findSafeById(newId);

    return this.createSession(user);
  }

  async login({ correo, nombre_usuario, contrasena }) {
    const identificador = correo || nombre_usuario;
    const contrasenaIngresada = contrasena;

    if (!identificador || !contrasenaIngresada) throw new AppError('correo o nombre_usuario y contrasena son obligatorios', 400);

    const user = await AuthRepository.findByCorreoOrNombreUsuario(identificador);

    if (!user) throw new AppError('Credenciales invalidas', 401);

    const valid = await compareValue(contrasenaIngresada, user.contrasena_hash);

    if (!valid) throw new AppError('Credenciales invalidas', 401);

    if (shouldRehashValue(user.contrasena_hash)) {
      await AuthRepository.updatePasswordHash(user.id, await hashValue(contrasenaIngresada));
    }

    delete user.contrasena_hash;

    return this.createSession(user);
  }

  async refresh(refreshToken) {
    if (!refreshToken) throw new AppError('No autenticado', 401);

    const tokenHash = hashRefreshToken(refreshToken);
    const previous = await RefreshTokenRepository.findByTokenHash(tokenHash);

    if (!previous) throw new AppError('No autenticado', 401);

    if (previous.revoked_at) {
      await RefreshTokenRepository.revokeFamily(previous.family_id);
      throw new AppError('No autenticado', 401);
    }

    if (new Date(previous.expires_at).getTime() <= Date.now()) {
      await RefreshTokenRepository.revoke(tokenHash);
      throw new AppError('No autenticado', 401);
    }

    const user = await AuthRepository.findSafeById(previous.id_usuario);
    if (!user || user.activo === false) {
      await RefreshTokenRepository.revokeFamily(previous.family_id);
      throw new AppError('No autenticado', 401);
    }

    const session = await this.createSession(user, previous.family_id);
    await RefreshTokenRepository.revoke(tokenHash, hashRefreshToken(session.refreshToken));

    return session;
  }

  async logout(refreshToken) {
    if (!refreshToken) return { revoked: false };

    const tokenHash = hashRefreshToken(refreshToken);
    const existing = await RefreshTokenRepository.findByTokenHash(tokenHash);

    if (!existing) return { revoked: false };

    await RefreshTokenRepository.revoke(tokenHash);
    return { revoked: true };
  }

  async me(req) {
    if (!req.user?.id) throw new AppError('No autenticado', 401);

    const user = await AuthRepository.findSafeById(req.user.id);

    if (!user) throw new AppError('Usuario no encontrado', 404);

    return user;
  }
}

export default new AuthService();
