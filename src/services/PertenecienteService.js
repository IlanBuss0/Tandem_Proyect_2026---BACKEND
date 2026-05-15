import BaseCrudService from './BaseCrudService.js';
import PertenecienteRepository from '../repositories/PertenecienteRepository.js';
import AppError from '../modules/errors/AppError.js';

class PertenecienteService extends BaseCrudService {
  constructor() {
    super(PertenecienteRepository, { hiddenFields: [] });
  }

  async findAll() { return this.list(); }
  async findById(id) { return this.getById(id); }

  async create(data) {
    if (!data?.id_usuario || !data?.id_nivel_apoyo || !data?.id_autonomia_operativa) {
      throw new AppError('id_usuario, id_nivel_apoyo e id_autonomia_operativa son obligatorios', 400);
    }
    return super.create(data);
  }

  findTutores(idPerteneciente) { return this.repository.findTutores(idPerteneciente); }
  findProfesionales(idPerteneciente) { return this.repository.findProfesionales(idPerteneciente); }
  findActividades(idPerteneciente) { return this.repository.findActividades(idPerteneciente); }
  findRutinas(idPerteneciente) { return this.repository.findRutinas(idPerteneciente); }
  findEventos(idPerteneciente) { return this.repository.findEventos(idPerteneciente); }
  findEmociones(idPerteneciente) { return this.repository.findEmociones(idPerteneciente); }
  findObjetivos(idPerteneciente) { return this.repository.findObjetivos(idPerteneciente); }
  findUbicaciones(idPerteneciente) { return this.repository.findUbicaciones(idPerteneciente); }
  findNotificaciones(idPerteneciente) { return this.repository.findNotificaciones(idPerteneciente); }

  async getDashboard(idPerteneciente) {
    const perteneciente = await this.getById(idPerteneciente);
    const [tutores, profesionales, actividades, rutinas, eventos, emociones, objetivos, ubicaciones, notificaciones] = await Promise.all([
      this.findTutores(idPerteneciente),
      this.findProfesionales(idPerteneciente),
      this.findActividades(idPerteneciente),
      this.findRutinas(idPerteneciente),
      this.findEventos(idPerteneciente),
      this.findEmociones(idPerteneciente),
      this.findObjetivos(idPerteneciente),
      this.findUbicaciones(idPerteneciente),
      this.findNotificaciones(idPerteneciente),
    ]);

    return { perteneciente, tutores, profesionales, actividades, rutinas, eventos, emociones, objetivos, ubicaciones, notificaciones };
  }
}

export default new PertenecienteService();
