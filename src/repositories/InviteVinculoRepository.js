import BD from '../db/BD.js';

export default class InviteVinculoRepository {
  createAsync = async (entity) => {
    const sql = `
      INSERT INTO invites_vinculo (
        codigo,
        token,
        id_tutor_creador,
        estado,
        fecha_expiracion,
        fecha_creacion,
        fecha_uso
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `;

    const values = [
      entity.codigo,
      entity.token,
      entity.id_tutor_creador,
      entity.estado ?? 'activo',
      entity.fecha_expiracion,
      entity.fecha_creacion ?? new Date(),
      entity.fecha_uso ?? null,
    ];

    const result = await BD.queryOne(sql, values);
    return result?.id ?? 0;
  };

  getByCodigoAsync = async (codigo) => {
    return await BD.queryOne(
      `SELECT * FROM invites_vinculo WHERE codigo = $1`,
      [codigo],
    );
  };

  getByTokenAsync = async (token) => {
    return await BD.queryOne(
      `SELECT * FROM invites_vinculo WHERE token = $1`,
      [token],
    );
  };

  getByTutorCreadorAsync = async (idTutor) => {
    return await BD.query(
      `SELECT * FROM invites_vinculo WHERE id_tutor_creador = $1 ORDER BY fecha_creacion DESC`,
      [idTutor],
    );
  };

  marcarUsadoAsync = async (id) => {
    return await BD.execute(
      `UPDATE invites_vinculo SET estado = 'usado', fecha_uso = CURRENT_TIMESTAMP WHERE id = $1`,
      [id],
    );
  };

  marcarExpiradosAsync = async () => {
    return await BD.execute(
      `UPDATE invites_vinculo SET estado = 'expirado' WHERE estado = 'activo' AND fecha_expiracion < CURRENT_TIMESTAMP`,
    );
  };
}
