import BD from '../db/BD.js';

export default class NoteTemplateFavoriteRepository {
  constructor() {
    console.log('Estoy en: NoteTemplateFavoriteRepository.constructor()');
  }

  getByProfesionalIdAsync = async (idProfesional) => {
    console.log(`NoteTemplateFavoriteRepository.getByProfesionalIdAsync(${idProfesional})`);
    const sql = `
      SELECT id, id_profesional, template_id, fecha_marcado
      FROM favoritos_plantillas_notas
      WHERE id_profesional = $1
      ORDER BY fecha_marcado DESC
    `;
    return await BD.query(sql, [idProfesional]);
  };

  addAsync = async (idProfesional, templateId) => {
    console.log(`NoteTemplateFavoriteRepository.addAsync(${idProfesional}, ${templateId})`);
    const sql = `
      INSERT INTO favoritos_plantillas_notas (id_profesional, template_id)
      VALUES ($1, $2)
      ON CONFLICT (id_profesional, template_id) DO NOTHING
      RETURNING id, id_profesional, template_id, fecha_marcado
    `;
    const result = await BD.queryOne(sql, [idProfesional, templateId]);
    if (result) return result;
    return await BD.queryOne(
      `SELECT id, id_profesional, template_id, fecha_marcado FROM favoritos_plantillas_notas
       WHERE id_profesional = $1 AND template_id = $2`,
      [idProfesional, templateId],
    );
  };

  removeAsync = async (idProfesional, templateId) => {
    console.log(`NoteTemplateFavoriteRepository.removeAsync(${idProfesional}, ${templateId})`);
    const sql = `DELETE FROM favoritos_plantillas_notas WHERE id_profesional = $1 AND template_id = $2`;
    return await BD.execute(sql, [idProfesional, templateId]);
  };
}
