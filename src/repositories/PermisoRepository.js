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

  findCatalogoPertenecienteByNombre = async (nombre) => {
    console.log(`PermisoRepository.findCatalogoPertenecienteByNombre(${nombre})`);

    const sql = `
      SELECT id, nombre, orden
      FROM catalogo_permisos_pertenecientes
      WHERE LOWER(nombre) = LOWER($1)
      LIMIT 1
    `;

    return await BD.queryOne(sql, [nombre]);
  };

  findCatalogoProfesionalByNombre = async (nombre) => {
    console.log(`PermisoRepository.findCatalogoProfesionalByNombre(${nombre})`);

    const sql = `
      SELECT id, nombre, orden
      FROM catalogo_permisos_profesionales
      WHERE LOWER(nombre) = LOWER($1)
      LIMIT 1
    `;

    return await BD.queryOne(sql, [nombre]);
  };

  findPertenecientePermissionByName = async (idPerteneciente, nombre) => {
    console.log(`PermisoRepository.findPertenecientePermissionByName(${idPerteneciente}, ${nombre})`);

    const sql = `
      SELECT
        pop.id,
        pop.id_perteneciente,
        pop.id_permiso_perteneciente,
        cpp.nombre AS permiso,
        pop.habilitado,
        pop.id_usuario_modificador,
        pop.fecha_modificacion
      FROM permisos_otorgados_pertenecientes pop
      INNER JOIN catalogo_permisos_pertenecientes cpp
        ON cpp.id = pop.id_permiso_perteneciente
      WHERE pop.id_perteneciente = $1
        AND LOWER(cpp.nombre) = LOWER($2)
      LIMIT 1
    `;

    return await BD.queryOne(sql, [idPerteneciente, nombre]);
  };

  findProfesionalPermissionByName = async (idVinculo, nombre) => {
    console.log(`PermisoRepository.findProfesionalPermissionByName(${idVinculo}, ${nombre})`);

    const sql = `
      SELECT
        pop.id,
        pop.id_vinculo_profesional_perteneciente,
        pop.id_permiso_profesional,
        cpp.nombre AS permiso,
        pop.habilitado,
        pop.id_usuario_modificador,
        pop.fecha_modificacion
      FROM permisos_otorgados_profesionales pop
      INNER JOIN catalogo_permisos_profesionales cpp
        ON cpp.id = pop.id_permiso_profesional
      WHERE pop.id_vinculo_profesional_perteneciente = $1
        AND LOWER(cpp.nombre) = LOWER($2)
      LIMIT 1
    `;

    return await BD.queryOne(sql, [idVinculo, nombre]);
  };

  setPertenecientePermissionByName = async ({
    idPerteneciente,
    nombrePermiso,
    habilitado,
    idUsuarioModificador,
    motivo,
    habilitadoAnterior,
    shouldInsertHistorial,
  }) => {
    console.log(`PermisoRepository.setPertenecientePermissionByName(${idPerteneciente}, ${nombrePermiso})`);

    return await BD.transaction(async (client) => {
      const catalogoResult = await client.query(
        `
          SELECT id, nombre, orden
          FROM catalogo_permisos_pertenecientes
          WHERE LOWER(nombre) = LOWER($1)
          LIMIT 1
        `,
        [nombrePermiso],
      );
      const catalogo = catalogoResult.rows[0] || null;
      if (!catalogo) return { catalogo: null, permiso: null, historial: null };

      const permisoResult = await client.query(
        `
          INSERT INTO permisos_otorgados_pertenecientes (
            id_perteneciente,
            id_permiso_perteneciente,
            habilitado,
            id_usuario_modificador,
            fecha_modificacion
          )
          VALUES ($1, $2, $3, $4, NOW())
          ON CONFLICT (id_perteneciente, id_permiso_perteneciente)
          DO UPDATE SET
            habilitado = EXCLUDED.habilitado,
            id_usuario_modificador = EXCLUDED.id_usuario_modificador,
            fecha_modificacion = EXCLUDED.fecha_modificacion
          RETURNING
            id,
            id_perteneciente,
            id_permiso_perteneciente,
            habilitado,
            id_usuario_modificador,
            fecha_modificacion
        `,
        [idPerteneciente, catalogo.id, habilitado, idUsuarioModificador],
      );
      const permiso = permisoResult.rows[0];

      let historial = null;
      if (shouldInsertHistorial) {
        const historialResult = await client.query(
          `
            INSERT INTO historial_permisos_otorgados_pertenecientes (
              id_perteneciente,
              id_permiso_perteneciente,
              habilitado_anterior,
              habilitado_nuevo,
              id_usuario_modificador,
              motivo,
              fecha_modificacion
            )
            VALUES ($1, $2, $3, $4, $5, $6, NOW())
            RETURNING
              id,
              id_perteneciente,
              id_permiso_perteneciente,
              habilitado_anterior,
              habilitado_nuevo,
              id_usuario_modificador,
              motivo,
              fecha_modificacion
          `,
          [idPerteneciente, catalogo.id, habilitadoAnterior, habilitado, idUsuarioModificador, motivo ?? null],
        );
        historial = historialResult.rows[0];
      }

      return { catalogo, permiso, historial };
    });
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

  setProfesionalPermissionByName = async ({
    idVinculo,
    nombrePermiso,
    habilitado,
    idUsuarioModificador,
    motivo,
    habilitadoAnterior,
    shouldInsertHistorial,
  }) => {
    console.log(`PermisoRepository.setProfesionalPermissionByName(${idVinculo}, ${nombrePermiso})`);

    return await BD.transaction(async (client) => {
      const catalogoResult = await client.query(
        `
          SELECT id, nombre, orden
          FROM catalogo_permisos_profesionales
          WHERE LOWER(nombre) = LOWER($1)
          LIMIT 1
        `,
        [nombrePermiso],
      );
      const catalogo = catalogoResult.rows[0] || null;
      if (!catalogo) return { catalogo: null, permiso: null, historial: null };

      const permisoResult = await client.query(
        `
          INSERT INTO permisos_otorgados_profesionales (
            id_vinculo_profesional_perteneciente,
            id_permiso_profesional,
            habilitado,
            id_usuario_modificador,
            fecha_modificacion
          )
          VALUES ($1, $2, $3, $4, NOW())
          ON CONFLICT (id_vinculo_profesional_perteneciente, id_permiso_profesional)
          DO UPDATE SET
            habilitado = EXCLUDED.habilitado,
            id_usuario_modificador = EXCLUDED.id_usuario_modificador,
            fecha_modificacion = EXCLUDED.fecha_modificacion
          RETURNING
            id,
            id_vinculo_profesional_perteneciente,
            id_permiso_profesional,
            habilitado,
            id_usuario_modificador,
            fecha_modificacion
        `,
        [idVinculo, catalogo.id, habilitado, idUsuarioModificador],
      );
      const permiso = permisoResult.rows[0];

      let historial = null;
      if (shouldInsertHistorial) {
        const historialResult = await client.query(
          `
            INSERT INTO historial_permisos_otorgados_profesionales (
              id_vinculo_profesional_perteneciente,
              id_permiso_profesional,
              habilitado_anterior,
              habilitado_nuevo,
              id_usuario_modificador,
              motivo,
              fecha_modificacion
            )
            VALUES ($1, $2, $3, $4, $5, $6, NOW())
            RETURNING
              id,
              id_vinculo_profesional_perteneciente,
              id_permiso_profesional,
              habilitado_anterior,
              habilitado_nuevo,
              id_usuario_modificador,
              motivo,
              fecha_modificacion
          `,
          [idVinculo, catalogo.id, habilitadoAnterior, habilitado, idUsuarioModificador, motivo ?? null],
        );
        historial = historialResult.rows[0];
      }

      return { catalogo, permiso, historial };
    });
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
