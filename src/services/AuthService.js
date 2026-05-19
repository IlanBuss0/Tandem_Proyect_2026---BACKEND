import AppError from '../modules/errors/AppError.js';
import AuthRepository from '../repositories/AuthRepository.js';
import UsuarioServiceClass from './UsuarioService.js';
import { compareValue, hashValue } from '../modules/security/hash.helper.js';
import { signJwt } from '../modules/security/jwt.helper.js';

const UsuarioService = new UsuarioServiceClass();

class AuthService {
  async register(data) {
    const entity = { ...data };

    if (!entity.contrasena_hash && entity.password) {
      entity.contrasena_hash = await hashValue(entity.password);
    }

    if (!entity.fecha_ingreso) {
      entity.fecha_ingreso = new Date();
    }

    const newId = await UsuarioService.createAsync(entity);
    const user = await AuthRepository.findSafeById(newId);
    const token = signJwt({ id: user.id, correo: user.correo, nombre_usuario: user.nombre_usuario });

    return { user, token };
  }

  async login({ identifier, password }) {
    if (!identifier || !password) throw new AppError('identifier y password son obligatorios', 400);

    const user = await AuthRepository.findByEmailOrUsername(identifier);

    if (!user) throw new AppError('Credenciales invalidas', 401);

    const valid = await compareValue(password, user.contrasena_hash || user.password_hash || user.password);

    if (!valid) throw new AppError('Credenciales invalidas', 401);

    delete user.contrasena_hash;
    delete user.password_hash;
    delete user.password;

    const token = signJwt({ id: user.id, correo: user.correo, nombre_usuario: user.nombre_usuario });

    return { user, token };
  }

  async me(req) {
    if (!req.user?.id) throw new AppError('No autenticado', 401);

    const user = await AuthRepository.findSafeById(req.user.id);

    if (!user) throw new AppError('Usuario no encontrado', 404);

    return user;
  }
}

export default new AuthService();
