import AppError from '../modules/errors/AppError.js';
import AuthRepository from '../repositories/AuthRepository.js';
import UsuarioService from './UsuarioService.js';

class AuthService {
  async register(data) {
    return UsuarioService.create(data);
  }

  async login({ identifier, password }) {
    if (!identifier || !password) throw new AppError('identifier y password son obligatorios', 400);
    const user = await AuthRepository.findByEmailOrUsername(identifier);
    if (!user) throw new AppError('Credenciales inválidas', 401);

    const valid = user.password_hash ? user.password_hash === password : user.password === password;
    if (!valid) throw new AppError('Credenciales inválidas', 401);
    delete user.password_hash;
    delete user.password;
    return { user, token: null, message: 'JWT pendiente de implementación' };
  }

  async me() {
    throw new AppError('Auth me requiere JWT, pendiente de implementación', 501);
  }
}

export default new AuthService();
