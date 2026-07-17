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

  getByProfesionalIdAsync = async (idProfesional) => {
    console.log(`VinculoProfesionalPertenecienteRepository.getByProfesionalIdAsync(${idProfesional})`);
    const sql = `SELECT id, id_profesional, id_perteneciente, id_estado_vinculo, requiere_aprobacion_tutor, fue_aprobado_por_tutor, id_tutor_aprobador, fecha_solicitud, fecha_resolucion FROM vinculos_profesional_pertenecientes WHERE id_profesional = $1 ORDER BY id DESC`;
    return await BD.query(sql, [idProfesional]);
  };

  getByPertenecienteIdAsync = async (idPerteneciente) => {
    console.log(`VinculoProfesionalPertenecienteRepository.getByPertenecienteIdAsync(${idPerteneciente})`);
    const sql = `SELECT id, id_profesional, id_perteneciente, id_estado_vinculo, requiere_aprobacion_tutor, fue_aprobado_por_tutor, id_tutor_aprobador, fecha_solicitud, fecha_resolucion FROM vinculos_profesional_pertenecientes WHERE id_perteneciente = $1 ORDER BY id DESC`;
    return await BD.query(sql, [idPerteneciente]);
  };

  getByTutorIdAsync = async (idTutor) => {
    console.log(`VinculoProfesionalPertenecienteRepository.getByTutorIdAsync(${idTutor})`);
    const sql = `
      SELECT vpp.id, vpp.id_profesional, vpp.id_perteneciente, vpp.id_estado_vinculo,
             vpp.requiere_aprobacion_tutor, vpp.fue_aprobado_por_tutor, vpp.id_tutor_aprobador,
             vpp.fecha_solicitud, vpp.fecha_resolucion
      FROM vinculos_profesional_pertenecientes vpp
      INNER JOIN vinculos_tutor_pertenecientes vtp ON vtp.id_perteneciente = vpp.id_perteneciente
      WHERE vtp.id_tutor = $1
      ORDER BY vpp.id DESC
    `;
    return await BD.query(sql, [idTutor]);
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

  getProfesionalActivoByIdAsync = async (idProfesional) => {
    console.log(`VinculoProfesionalPertenecienteRepository.getProfesionalActivoByIdAsync(${idProfesional})`);
    const sql = `
      SELECT
        p.id,
        p.id_usuario,
        p.profesion,
        p.especialidad,
        p.matricula,
        p.institucion,
        p.id_estado_validacion,
        u.activo AS usuario_activo
      FROM profesionales p
      INNER JOIN usuarios u ON u.id = p.id_usuario
      WHERE p.id = $1
        AND u.activo = true
      LIMIT 1
    `;
    return await BD.queryOne(sql, [idProfesional]);
  };

  getEstadoVinculoActivoAsync = async () => {
    return await BD.queryOne(
      `
        SELECT id, nombre
        FROM estados_vinculos
        WHERE LOWER(nombre) IN ('activo', 'activa', 'aprobado', 'aprobada', 'aceptado', 'aceptada')
        ORDER BY
          CASE LOWER(nombre)
            WHEN 'activo' THEN 1
            WHEN 'activa' THEN 2
            ELSE 3
          END,
          orden ASC NULLS LAST,
          id ASC
        LIMIT 1
      `,
    );
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

  approveByTutorAsync = async ({ id, idEstadoVinculo, idTutorAprobador }) => {
    console.log(`VinculoProfesionalPertenecienteRepository.approveByTutorAsync(${id})`);
    const sql = `
      UPDATE vinculos_profesional_pertenecientes
      SET
        id_estado_vinculo = $2,
        requiere_aprobacion_tutor = true,
        fue_aprobado_por_tutor = true,
        id_tutor_aprobador = $3,
        fecha_resolucion = NOW()
      WHERE id = $1
      RETURNING id
    `;
    const result = await BD.queryOne(sql, [id, idEstadoVinculo, idTutorAprobador]);
    return result?.id ?? 0;
  };

  createInviteAsync = async (entity) => {
    const sql = `
      INSERT INTO invites_vinculo_profesional (
        codigo,
        token,
        id_tutor_creador,
        id_perteneciente,
        estado,
        fecha_expiracion,
        fecha_creacion,
        fecha_uso
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `;

    const values = [
      entity.codigo,
      entity.token,
      entity.id_tutor_creador,
      entity.id_perteneciente,
      entity.estado ?? 'activo',
      entity.fecha_expiracion,
      entity.fecha_creacion ?? new Date(),
      entity.fecha_uso ?? null,
    ];

    const result = await BD.queryOne(sql, values);
    return result?.id ?? 0;
  };

  getInviteByCodigoAsync = async (codigo) => {
    return await BD.queryOne(
      `SELECT * FROM invites_vinculo_profesional WHERE codigo = $1`,
      [codigo],
    );
  };

  getInviteByTokenAsync = async (token) => {
    return await BD.queryOne(
      `SELECT * FROM invites_vinculo_profesional WHERE token = $1`,
      [token],
    );
  };

  marcarInviteUsadoAsync = async (id) => {
    return await BD.execute(
      `UPDATE invites_vinculo_profesional SET estado = 'usado', fecha_uso = CURRENT_TIMESTAMP WHERE id = $1`,
      [id],
    );
  };

  marcarInvitesExpiradosAsync = async () => {
    return await BD.execute(
      `UPDATE invites_vinculo_profesional SET estado = 'expirado' WHERE estado = 'activo' AND fecha_expiracion < CURRENT_TIMESTAMP`,
    );
  };

  deleteByIdAsync = async (id) => {
    console.log(`VinculoProfesionalPertenecienteRepository.deleteByIdAsync(${id})`);
    return await BD.transaction(async (client) => {
      await client.query(
        `DELETE FROM historial_permisos_otorgados_profesionales WHERE id_vinculo_profesional_perteneciente = $1`,
        [id],
      );

      await client.query(
        `DELETE FROM permisos_otorgados_profesionales WHERE id_vinculo_profesional_perteneciente = $1`,
        [id],
      );

      const result = await client.query(
        `DELETE FROM vinculos_profesional_pertenecientes WHERE id = $1`,
        [id],
      );

      return result.rowCount;
    });
  };
}
