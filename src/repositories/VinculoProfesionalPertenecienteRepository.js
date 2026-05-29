import BD from '../db/BD.js';

export default class VinculoProfesionalPertenecienteRepository {
  constructor() {
    console.log('Estoy en: VinculoProfesionalPertenecienteRepository.constructor()');
  }

  getAllAsync = async () => {
    console.log('VinculoProfesionalPertenecienteRepository.getAllAsync()');
    const sql = `SELECT id, id_profesional, id_perteneciente, id_estado_vinculo, requiere_aprobacion_tutor, fue_aprobado_por_tutor, id_tutor_aprobador, fecha_solicitud, fecha_resolucion FROM vinculos_profesional_pertenecientes ORDER BY id DESC`;
    return await BD.query(sql);
  };

  getByIdAsync = async (id) => {
    console.log(`VinculoProfesionalPertenecienteRepository.getByIdAsync(${id})`);
    const sql = `SELECT id, id_profesional, id_perteneciente, id_estado_vinculo, requiere_aprobacion_tutor, fue_aprobado_por_tutor, id_tutor_aprobador, fecha_solicitud, fecha_resolucion FROM vinculos_profesional_pertenecientes WHERE id = $1`;
    return await BD.queryOne(sql, [id]);
  };

  getByProfesionalYPertenecienteAsync = async (idProfesional, idPerteneciente) => {
    console.log(`VinculoProfesionalPertenecienteRepository.getByProfesionalYPertenecienteAsync(${idProfesional}, ${idPerteneciente})`);
    const sql = `
      SELECT
        vpp.id,
        vpp.id_profesional,
        vpp.id_perteneciente,
        vpp.id_estado_vinculo,
        ev.nombre AS estado_vinculo,
        vpp.requiere_aprobacion_tutor,
        vpp.fue_aprobado_por_tutor,
        vpp.id_tutor_aprobador,
        vpp.fecha_solicitud,
        vpp.fecha_resolucion
      FROM vinculos_profesional_pertenecientes vpp
      INNER JOIN estados_vinculos ev ON ev.id = vpp.id_estado_vinculo
      WHERE vpp.id_profesional = $1
        AND vpp.id_perteneciente = $2
      LIMIT 1
    `;
    return await BD.queryOne(sql, [idProfesional, idPerteneciente]);
  };

  createAsync = async (entity) => {
    console.log(`VinculoProfesionalPertenecienteRepository.createAsync(${JSON.stringify(entity)})`);
    const sql = `INSERT INTO vinculos_profesional_pertenecientes (id_profesional, id_perteneciente, id_estado_vinculo, requiere_aprobacion_tutor, fue_aprobado_por_tutor, id_tutor_aprobador, fecha_solicitud, fecha_resolucion) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`;
    const values = [entity?.id_profesional ?? null, entity?.id_perteneciente ?? null, entity?.id_estado_vinculo ?? null, entity?.requiere_aprobacion_tutor ?? null, entity?.fue_aprobado_por_tutor ?? null, entity?.id_tutor_aprobador ?? null, entity?.fecha_solicitud ?? null, entity?.fecha_resolucion ?? null];
    const result = await BD.queryOne(sql, values);
    return result?.id ?? 0;
  };

  updateAsync = async (entity) => {
    console.log(`VinculoProfesionalPertenecienteRepository.updateAsync(${JSON.stringify(entity)})`);
    const id = entity.id;
    const previousEntity = await this.getByIdAsync(id);
    if (previousEntity == null) return 0;
    const sql = `UPDATE vinculos_profesional_pertenecientes SET id_profesional = $2, id_perteneciente = $3, id_estado_vinculo = $4, requiere_aprobacion_tutor = $5, fue_aprobado_por_tutor = $6, id_tutor_aprobador = $7, fecha_solicitud = $8, fecha_resolucion = $9 WHERE id = $1`;
    const values = [id, entity?.id_profesional ?? previousEntity.id_profesional, entity?.id_perteneciente ?? previousEntity.id_perteneciente, entity?.id_estado_vinculo ?? previousEntity.id_estado_vinculo, entity?.requiere_aprobacion_tutor ?? previousEntity.requiere_aprobacion_tutor, entity?.fue_aprobado_por_tutor ?? previousEntity.fue_aprobado_por_tutor, entity?.id_tutor_aprobador ?? previousEntity.id_tutor_aprobador, entity?.fecha_solicitud ?? previousEntity.fecha_solicitud, entity?.fecha_resolucion ?? previousEntity.fecha_resolucion];
    return await BD.execute(sql, values);
  };

  deleteByIdAsync = async (id) => {
    console.log(`VinculoProfesionalPertenecienteRepository.deleteByIdAsync(${id})`);
    const sql = `DELETE FROM vinculos_profesional_pertenecientes WHERE id = $1`;
    return await BD.execute(sql, [id]);
  };
}
