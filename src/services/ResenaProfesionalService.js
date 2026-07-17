import ResenaProfesionalRepository from '../repositories/ResenaProfesionalRepository.js';
import AppError from '../modules/errors/AppError.js';

export default class ResenaProfesionalService {
  constructor() {
    console.log('Estoy en: ResenaProfesionalService.constructor()');
    this.ResenaProfesionalRepository = new ResenaProfesionalRepository();
  }

  getAllAsync = async () => {
    console.log('ResenaProfesionalService.getAllAsync()');
    const returnArray = await this.ResenaProfesionalRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`ResenaProfesionalService.getByIdAsync(${id})`);
    const returnEntity = await this.ResenaProfesionalRepository.getByIdAsync(id);
    return returnEntity;
  };

  createMineAsync = async (idUsuario, { id_profesional, puntaje, comentario } = {}) => {
    console.log(`ResenaProfesionalService.createMineAsync(${idUsuario})`);

    const idProfesionalNum = Number(id_profesional);
    if (!Number.isInteger(idProfesionalNum) || idProfesionalNum <= 0) {
      throw new AppError('id_profesional es obligatorio.', 400);
    }

    const puntajeNum = Number(puntaje);
    if (!Number.isInteger(puntajeNum) || puntajeNum < 1 || puntajeNum > 5) {
      throw new AppError('puntaje debe ser un entero entre 1 y 5.', 400);
    }

    const entity = {
      id_profesional: idProfesionalNum,
      id_usuario: idUsuario,
      puntaje: puntajeNum,
      comentario: comentario ?? null,
      fecha_resena: new Date(),
    };

    return await this.ResenaProfesionalRepository.createAsync(entity);
  };

  updateMineAsync = async (idUsuario, id, { puntaje, comentario } = {}) => {
    console.log(`ResenaProfesionalService.updateMineAsync(${idUsuario}, ${id})`);

    const previousEntity = await this.ResenaProfesionalRepository.getByIdAsync(id);
    if (previousEntity == null) return 0;
    if (previousEntity.id_usuario !== idUsuario) {
      throw new AppError('No autorizado para editar esta resena.', 403);
    }

    const entity = { id, id_profesional: previousEntity.id_profesional, id_usuario: idUsuario };
    if (puntaje !== undefined) {
      const puntajeNum = Number(puntaje);
      if (!Number.isInteger(puntajeNum) || puntajeNum < 1 || puntajeNum > 5) {
        throw new AppError('puntaje debe ser un entero entre 1 y 5.', 400);
      }
      entity.puntaje = puntajeNum;
    }
    if (comentario !== undefined) entity.comentario = comentario;

    return await this.ResenaProfesionalRepository.updateAsync(entity);
  };

  deleteMineAsync = async (idUsuario, id) => {
    console.log(`ResenaProfesionalService.deleteMineAsync(${idUsuario}, ${id})`);

    const previousEntity = await this.ResenaProfesionalRepository.getByIdAsync(id);
    if (previousEntity == null) return 0;
    if (previousEntity.id_usuario !== idUsuario) {
      throw new AppError('No autorizado para eliminar esta resena.', 403);
    }

    return await this.ResenaProfesionalRepository.deleteByIdAsync(id);
  };
}
