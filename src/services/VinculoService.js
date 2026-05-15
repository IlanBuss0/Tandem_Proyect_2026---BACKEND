import AppError from '../modules/errors/AppError.js';
import vinculoTutorRepo from '../repositories/vinculo_tutor_perteneciente_repository.js';
import vinculoProfesionalRepo from '../repositories/vinculo_profesional_perteneciente_repository.js';

class VinculoService {
  listTutorPerteneciente() { return vinculoTutorRepo.findAll(); }
  createTutorPerteneciente(body) { return vinculoTutorRepo.create(body); }
  async removeTutorPerteneciente(id) {
    const ok = await vinculoTutorRepo.remove(id);
    if (!ok) throw new AppError('Vínculo no encontrado', 404);
  }

  listProfesionalPerteneciente() { return vinculoProfesionalRepo.findAll(); }
  createProfesionalPerteneciente(body) { return vinculoProfesionalRepo.create(body); }
  async removeProfesionalPerteneciente(id) {
    const ok = await vinculoProfesionalRepo.remove(id);
    if (!ok) throw new AppError('Vínculo no encontrado', 404);
  }

  getPertenecientesByTutor(idTutor) { return vinculoTutorRepo.findByTutor(idTutor); }
  getTutoresByPerteneciente(idPerteneciente) { return vinculoTutorRepo.findByPerteneciente(idPerteneciente); }
  getPertenecientesByProfesional(idProfesional) { return vinculoProfesionalRepo.findByProfesional(idProfesional); }
  getProfesionalesByPerteneciente(idPerteneciente) { return vinculoProfesionalRepo.findByPerteneciente(idPerteneciente); }
}

export default new VinculoService();
