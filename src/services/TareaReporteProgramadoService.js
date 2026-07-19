import TareaReporteProgramadoRepository from '../repositories/TareaReporteProgramadoRepository.js';

const FRECUENCIAS = new Set(['diario', 'semanal', 'mensual']);

export default class TareaReporteProgramadoService {
  constructor() {
    console.log('Estoy en: TareaReporteProgramadoService.constructor()');
    this.TareaReporteProgramadoRepository = new TareaReporteProgramadoRepository();
  }

  getByProfesionalIdAsync = async (idProfesional) => {
    return await this.TareaReporteProgramadoRepository.getByProfesionalIdAsync(idProfesional);
  };

  upsertAsync = async (idProfesional, { id_perteneciente, frecuencia, enviar_automatico, activo = true }) => {
    console.log(`TareaReporteProgramadoService.upsertAsync(${idProfesional}, ${JSON.stringify({ id_perteneciente, frecuencia, enviar_automatico, activo })})`);
    const idPerteneciente = Number(id_perteneciente);
    if (!idPerteneciente || Number.isNaN(idPerteneciente)) throw new Error('id_perteneciente es obligatorio.');
    if (!FRECUENCIAS.has(frecuencia)) throw new Error(`frecuencia debe ser una de: ${Array.from(FRECUENCIAS).join(', ')}.`);

    return await this.TareaReporteProgramadoRepository.upsertAsync({
      id_profesional: idProfesional,
      id_perteneciente: idPerteneciente,
      frecuencia,
      enviar_automatico: Boolean(enviar_automatico),
      activo: Boolean(activo),
    });
  };

  deactivateAsync = async (id, idProfesional) => {
    if (!id || Number.isNaN(id)) throw new Error('El id de la tarea es invalido.');
    return await this.TareaReporteProgramadoRepository.deactivateAsync(id, idProfesional);
  };

  claimDueAsync = async (limit) => {
    return await this.TareaReporteProgramadoRepository.claimDueAsync(limit);
  };
}
