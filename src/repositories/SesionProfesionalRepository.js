import BD from '../db/BD.js';

export default class SesionProfesionalRepository {
  constructor() {
    console.log('Estoy en: SesionProfesionalRepository.constructor()');
  }

  getAllAsync = async () => {
    console.log('SesionProfesionalRepository.getAllAsync()');
    const sql = `SELECT id, id_profesional, id_perteneciente, fecha_sesion, titulo, duracion_minutos, estado, recordatorios, legacy_calendar_event_id FROM sesiones_profesionales ORDER BY fecha_sesion DESC`;
    return await BD.query(sql);
  };

  getByIdAsync = async (id) => {
    console.log(`SesionProfesionalRepository.getByIdAsync(${id})`);
    const sql = `SELECT id, id_profesional, id_perteneciente, fecha_sesion, titulo, duracion_minutos, estado, recordatorios, legacy_calendar_event_id FROM sesiones_profesionales WHERE id = $1`;
    return await BD.queryOne(sql, [id]);
  };

  getByPertenecienteIdAsync = async (idPerteneciente) => {
    console.log(`SesionProfesionalRepository.getByPertenecienteIdAsync(${idPerteneciente})`);
    const sql = `SELECT id, id_profesional, id_perteneciente, fecha_sesion, titulo, duracion_minutos, estado, recordatorios, legacy_calendar_event_id FROM sesiones_profesionales WHERE id_perteneciente = $1 ORDER BY fecha_sesion DESC`;
    return await BD.query(sql, [idPerteneciente]);
  };

  getByProfesionalIdAsync = async (idProfesional) => {
    console.log(`SesionProfesionalRepository.getByProfesionalIdAsync(${idProfesional})`);
    const sql = `SELECT id, id_profesional, id_perteneciente, fecha_sesion, titulo, duracion_minutos, estado, recordatorios, legacy_calendar_event_id FROM sesiones_profesionales WHERE id_profesional = $1 ORDER BY fecha_sesion DESC`;
    return await BD.query(sql, [idProfesional]);
  };

  createAsync = async (entity) => {
    console.log(`SesionProfesionalRepository.createAsync(${JSON.stringify(entity)})`);
    const sql = `
      INSERT INTO sesiones_profesionales (id_profesional, id_perteneciente, fecha_sesion, titulo, duracion_minutos, estado, recordatorios, legacy_calendar_event_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8)
      RETURNING id
    `;
    const values = [
      entity?.id_profesional,
      entity?.id_perteneciente,
      entity?.fecha_sesion,
      entity?.titulo ?? 'Sesion profesional',
      entity?.duracion_minutos ?? 60,
      entity?.estado ?? 'programada',
      JSON.stringify(entity?.recordatorios ?? []),
      entity?.legacy_calendar_event_id ?? null,
    ];
    const result = await BD.queryOne(sql, values);
    return result?.id ?? 0;
  };

  updateAsync = async (entity) => {
    console.log(`SesionProfesionalRepository.updateAsync(${JSON.stringify(entity)})`);
    const id = entity.id;
    const previousEntity = await this.getByIdAsync(id);
    if (previousEntity == null) return 0;
    const sql = `
      UPDATE sesiones_profesionales
      SET id_profesional = $2, id_perteneciente = $3, fecha_sesion = $4, titulo = $5,
          duracion_minutos = $6, estado = $7, recordatorios = $8::jsonb
      WHERE id = $1
    `;
    const values = [
      id,
      entity?.id_profesional ?? previousEntity.id_profesional,
      entity?.id_perteneciente ?? previousEntity.id_perteneciente,
      entity?.fecha_sesion ?? previousEntity.fecha_sesion,
      entity?.titulo ?? previousEntity.titulo,
      entity?.duracion_minutos ?? previousEntity.duracion_minutos,
      entity?.estado ?? previousEntity.estado,
      JSON.stringify(entity?.recordatorios ?? previousEntity.recordatorios ?? []),
    ];
    return await BD.execute(sql, values);
  };

  getPrivateNoteAsync = async (idSesion, idProfesional) => {
    return await BD.queryOne(`
      SELECT n.id, n.id_sesion_profesional, n.id_profesional, n.contenido, n.version,
             n.fecha_creacion, n.fecha_actualizacion,
             CASE WHEN d.id IS NULL THEN NULL ELSE jsonb_build_object(
               'id', d.id, 'google_file_id', d.google_file_id, 'nombre', d.nombre,
               'mime_type', d.mime_type, 'web_view_url', d.web_view_url,
               'fecha_vinculacion', d.fecha_vinculacion
             ) END AS documento_drive
      FROM notas_privadas_profesionales n
      LEFT JOIN documentos_drive_notas d ON d.id_nota_privada = n.id
      WHERE n.id_sesion_profesional = $1 AND n.id_profesional = $2
    `, [idSesion, idProfesional]);
  };

  upsertPrivateNoteAsync = async (idSesion, idProfesional, contenido) => {
    return await BD.queryOne(`
      INSERT INTO notas_privadas_profesionales (id_sesion_profesional, id_profesional, contenido)
      VALUES ($1, $2, $3::jsonb)
      ON CONFLICT (id_sesion_profesional) DO UPDATE
      SET contenido = EXCLUDED.contenido,
          version = notas_privadas_profesionales.version + 1,
          fecha_actualizacion = NOW()
      WHERE notas_privadas_profesionales.id_profesional = EXCLUDED.id_profesional
      RETURNING id, id_sesion_profesional, id_profesional, contenido, version, fecha_creacion, fecha_actualizacion
    `, [idSesion, idProfesional, JSON.stringify(contenido)]);
  };

  upsertDriveDocumentAsync = async (idNota, document) => {
    return await BD.queryOne(`
      INSERT INTO documentos_drive_notas (id_nota_privada, google_file_id, nombre, mime_type, web_view_url)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (id_nota_privada) DO UPDATE
      SET google_file_id = EXCLUDED.google_file_id, nombre = EXCLUDED.nombre,
          mime_type = EXCLUDED.mime_type, web_view_url = EXCLUDED.web_view_url,
          fecha_vinculacion = NOW()
      RETURNING id, google_file_id, nombre, mime_type, web_view_url, fecha_vinculacion
    `, [idNota, document.google_file_id, document.nombre, document.mime_type, document.web_view_url]);
  };

  deleteDriveDocumentAsync = async (idNota) => {
    return await BD.execute('DELETE FROM documentos_drive_notas WHERE id_nota_privada = $1', [idNota]);
  };

  deleteByIdAsync = async (id) => {
    console.log(`SesionProfesionalRepository.deleteByIdAsync(${id})`);
    const sql = `DELETE FROM sesiones_profesionales WHERE id = $1`;
    return await BD.execute(sql, [id]);
  };
}
