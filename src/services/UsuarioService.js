import BaseCrudService from './BaseCrudService.js';
import UsuarioRepository from '../repositories/UsuarioRepository.js';
import AppError from '../modules/errors/AppError.js';
import { hashValue } from '../modules/security/hash.helper.js';

class UsuarioService extends BaseCrudService {
  constructor() {
    super(UsuarioRepository, { hiddenFields: ['password_hash', 'password'] });
  }

  async create(body) {
    if (body?.email && await this.repository.findByEmail(body.email)) throw new AppError('El email ya está registrado', 400);
    if (body?.nombre_usuario && await this.repository.findByNombreUsuario(body.nombre_usuario)) throw new AppError('El nombre de usuario ya existe', 400);
    const payload = { ...body };
    if (payload.password) {
      payload.password_hash = await hashValue(payload.password);
      delete payload.password;
    }
    return super.create(payload);
  }

  async update(id, body) {
    const payload = { ...body };
    if (payload.password) {
      payload.password_hash = await hashValue(payload.password);
      delete payload.password;
    }
    return super.update(id, payload);
  }
}

export default new UsuarioService();
