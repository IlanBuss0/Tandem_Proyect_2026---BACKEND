import BD from '../db/BD.js';

class PermisoRepository {
  findAllPertenecientes = async () => {
    console.log('PermisoRepository.findAllPertenecientes()');

    const sql = `
      SELECT
        id,
        id_perteneciente,
        id_permiso_perteneciente,
        habilitado,
        id_usuario_modificador,
        fecha_modificacion
      FROM permisos_otorgados_pertenecientes
      ORDER BY id DESC
    `;

    return await BD.query(sql);
  };

  findAllProfesionales = async () => {
    console.log('PermisoRepository.findAllProfesionales()');

    const sql = `
      SELECT
        id,
        id_vinculo_profesional_perteneciente,
        id_permiso_profesional,
        habilitado,
        id_usuario_modificador,
        fecha_modificacion
      FROM permisos_otorgados_profesionales
      ORDER BY id DESC
    `;

    return await BD.query(sql);
  };

  findByPerteneciente = async (idPerteneciente) => {
    console.log(`PermisoRepository.findByPerteneciente(${idPerteneciente})`);

    const sql = `
      SELECT
        id,
        id_perteneciente,
        id_permiso_perteneciente,
        habilitado,
        id_usuario_modificador,
        fecha_modificacion
      FROM permisos_otorgados_pertenecientes
      WHERE id_perteneciente = $1
      ORDER BY id DESC
    `;

    return await BD.query(sql, [idPerteneciente]);
  };

  findPertenecientePermissionById = async (id) => {
    console.log(`PermisoRepository.findPertenecientePermissionById(${id})`);

    const sql = `
      SELECT
        id,
        id_perteneciente,
        id_permiso_perteneciente,
        habilitado,
        id_usuario_modificador,
        fecha_modificacion
      FROM permisos_otorgados_pertenecientes
      WHERE id = $1
    `;

    return await BD.queryOne(sql, [id]);
  };

  findByProfesional = async (idProfesional) => {
    console.log(`PermisoRepository.findByProfesional(${idProfesional})`);

    const sql = `
      SELECT
        permisos_otorgados_profesionales.id,
        permisos_otorgados_profesionales.id_vinculo_profesional_perteneciente,
        permisos_otorgados_profesionales.id_permiso_profesional,
        permisos_otorgados_profesionales.habilitado,
        permisos_otorgados_profesionales.id_usuario_modificador,
        permisos_otorgados_profesionales.fecha_modificacion
      FROM permisos_otorgados_profesionales
      JOIN vinculos_profesional_pertenecientes
        ON vinculos_profesional_pertenecientes.id = permisos_otorgados_profesionales.id_vinculo_profesional_perteneciente
      WHERE vinculos_profesional_pertenecientes.id_profesional = $1
      ORDER BY permisos_otorgados_profesionales.id DESC
    `;

    return await BD.query(sql, [idProfesional]);
  };

  findProfesionalPermissionById = async (id) => {
    console.log(`PermisoRepository.findProfesionalPermissionById(${id})`);

    const sql = `
      SELECT
        id,
        id_vinculo_profesional_perteneciente,
        id_permiso_profesional,
        habilitado,
        id_usuario_modificador,
        fecha_modificacion
      FROM permisos_otorgados_profesionales
      WHERE id = $1
    `;

    return await BD.queryOne(sql, [id]);
  };

  createPerteneciente = async (entity) => {
    console.log('PermisoRepository.createPerteneciente()');

    const sql = `
      INSERT INTO permisos_otorgados_pertenecientes (
        id_perteneciente,
        id_permiso_perteneciente,
        habilitado,
        id_usuario_modificador,
        fecha_modificacion
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        id,
        id_perteneciente,
        id_permiso_perteneciente,
        habilitado,
        id_usuario_modificador,
        fecha_modificacion
    `;

    const values = [
      entity?.id_perteneciente,
      entity?.id_permiso_perteneciente,
      entity?.habilitado,
      entity?.id_usuario_modificador,
      entity?.fecha_modificacion,
    ];

    return await BD.queryOne(sql, values);
  };

  createProfesional = async (entity) => {
    console.log('PermisoRepository.createProfesional()');

    const sql = `
      INSERT INTO permisos_otorgados_profesionales (
        id_vinculo_profesional_perteneciente,
        id_permiso_profesional,
        habilitado,
        id_usuario_modificador,
        fecha_modificacion
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        id,
        id_vinculo_profesional_perteneciente,
        id_permiso_profesional,
        habilitado,
        id_usuario_modificador,
        fecha_modificacion
    `;

    const values = [
      entity?.id_vinculo_profesional_perteneciente,
      entity?.id_permiso_profesional,
      entity?.habilitado,
      entity?.id_usuario_modificador,
      entity?.fecha_modificacion,
    ];

    return await BD.queryOne(sql, values);
  };

  updatePerteneciente = async (id, entity) => {
    console.log(`PermisoRepository.updatePerteneciente(${id})`);

    const sql = `
      UPDATE permisos_otorgados_pertenecientes
      SET
        id_perteneciente = $2,
        id_permiso_perteneciente = $3,
        habilitado = $4,
        id_usuario_modificador = $5,
        fecha_modificacion = $6
      WHERE id = $1
      RETURNING
        id,
        id_perteneciente,
        id_permiso_perteneciente,
        habilitado,
        id_usuario_modificador,
        fecha_modificacion
    `;

    const values = [
      id,
      entity?.id_perteneciente,
      entity?.id_permiso_perteneciente,
      entity?.habilitado,
      entity?.id_usuario_modificador,
      entity?.fecha_modificacion,
    ];

    return await BD.queryOne(sql, values);
  };

  updateProfesional = async (id, entity) => {
    console.log(`PermisoRepository.updateProfesional(${id})`);

    const sql = `
      UPDATE permisos_otorgados_profesionales
      SET
        id_vinculo_profesional_perteneciente = $2,
        id_permiso_profesional = $3,
        habilitado = $4,
        id_usuario_modificador = $5,
        fecha_modificacion = $6
      WHERE id = $1
      RETURNING
        id,
        id_vinculo_profesional_perteneciente,
        id_permiso_profesional,
        habilitado,
        id_usuario_modificador,
        fecha_modificacion
    `;

    const values = [
      id,
      entity?.id_vinculo_profesional_perteneciente,
      entity?.id_permiso_profesional,
      entity?.habilitado,
      entity?.id_usuario_modificador,
      entity?.fecha_modificacion,
    ];

    return await BD.queryOne(sql, values);
  };

  removePerteneciente = async (id) => {
    console.log(`PermisoRepository.removePerteneciente(${id})`);

    const sql = `DELETE FROM permisos_otorgados_pertenecientes WHERE id = $1`;
    const count = await BD.execute(sql, [id]);

    return count > 0;
  };

  removeProfesional = async (id) => {
    console.log(`PermisoRepository.removeProfesional(${id})`);

    const sql = `DELETE FROM permisos_otorgados_profesionales WHERE id = $1`;
    const count = await BD.execute(sql, [id]);

    return count > 0;
  };
}

export default new PermisoRepository();
