import NoteTemplateFavoriteRepository from '../repositories/NoteTemplateFavoriteRepository.js';

const TEMPLATE_ID_PATTERN = /^[a-z0-9-]{1,60}$/;

export default class NoteTemplateFavoriteService {
  constructor() {
    console.log('Estoy en: NoteTemplateFavoriteService.constructor()');
    this.NoteTemplateFavoriteRepository = new NoteTemplateFavoriteRepository();
  }

  getByProfesionalIdAsync = async (idProfesional) => {
    console.log(`NoteTemplateFavoriteService.getByProfesionalIdAsync(${idProfesional})`);
    if (!idProfesional || Number.isNaN(idProfesional)) {
      throw new Error('El id del profesional es invalido.');
    }
    const rows = await this.NoteTemplateFavoriteRepository.getByProfesionalIdAsync(idProfesional);
    return rows.map((row) => row.template_id);
  };

  addAsync = async (idProfesional, templateId) => {
    console.log(`NoteTemplateFavoriteService.addAsync(${idProfesional}, ${templateId})`);
    this.validarTemplateId(templateId);
    return await this.NoteTemplateFavoriteRepository.addAsync(idProfesional, templateId);
  };

  removeAsync = async (idProfesional, templateId) => {
    console.log(`NoteTemplateFavoriteService.removeAsync(${idProfesional}, ${templateId})`);
    this.validarTemplateId(templateId);
    return await this.NoteTemplateFavoriteRepository.removeAsync(idProfesional, templateId);
  };

  validarTemplateId = (templateId) => {
    if (!TEMPLATE_ID_PATTERN.test(String(templateId || ''))) {
      const error = new Error('Identificador de plantilla invalido.');
      error.statusCode = 400;
      throw error;
    }
  };
}
