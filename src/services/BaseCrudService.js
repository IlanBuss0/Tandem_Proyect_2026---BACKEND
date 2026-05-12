import AppError from '../modules/errors/AppError.js';

export default class BaseCrudService {
  constructor(repository, { hiddenFields = [] } = {}) {
    this.repository = repository;
    this.hiddenFields = hiddenFields;
  }

  sanitize(row) {
    if (!row) return row;
    const copy = { ...row };
    this.hiddenFields.forEach((field) => delete copy[field]);
    return copy;
  }

  async list() {
    const rows = await this.repository.findAll();
    return rows.map((row) => this.sanitize(row));
  }

  async getById(id) {
    const row = await this.repository.findById(id);
    if (!row) throw new AppError('Registro no encontrado', 404);
    return this.sanitize(row);
  }

  async create(body) {
    if (!body || Object.keys(body).length === 0) throw new AppError('Body requerido', 400);
    const row = await this.repository.create(body);
    return this.sanitize(row);
  }

  async update(id, body) {
    if (!body || Object.keys(body).length === 0) throw new AppError('Body requerido', 400);
    const row = await this.repository.update(id, body);
    if (!row) throw new AppError('Registro no encontrado', 404);
    return this.sanitize(row);
  }

  async remove(id) {
    const ok = await this.repository.remove(id);
    if (!ok) throw new AppError('Registro no encontrado', 404);
  }
}
