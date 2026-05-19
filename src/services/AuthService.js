import AppError from '../modules/errors/AppError.js';
import AuthRepository from '../repositories/AuthRepository.js';
import UsuarioServiceClass from './UsuarioService.js';
import { compareValue, hashValue } from '../modules/security/hash.helper.js';
import { signJwt } from '../modules/security/jwt.helper.js';

const UsuarioService = new UsuarioServiceClass();

class AuthService {
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
    const token = signJwt({ id: user.id, correo: user.correo, nombre_usuario: user.nombre_usuario });

    return { user, token };
  }

  async login({ correo, nombre_usuario, contrasena }) {
    const identificador = correo || nombre_usuario;
    const contrasenaIngresada = contrasena;

    if (!identificador || !contrasenaIngresada) throw new AppError('correo o nombre_usuario y contrasena son obligatorios', 400);

    const user = await AuthRepository.findByCorreoOrNombreUsuario(identificador);

    if (!user) throw new AppError('Credenciales invalidas', 401);

    const valid = await compareValue(contrasenaIngresada, user.contrasena_hash);

    if (!valid) throw new AppError('Credenciales invalidas', 401);

    delete user.contrasena_hash;

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
