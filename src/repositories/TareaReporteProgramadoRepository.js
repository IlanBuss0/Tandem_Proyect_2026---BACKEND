import BD from '../db/BD.js';

const TAREA_COLUMNS = `id, id_profesional, id_perteneciente, frecuencia, proxima_ejecucion,
  enviar_automatico, activo, fecha_creacion`;

const INTERVAL_BY_FRECUENCIA = {
  diario: '1 day',
  semanal: '1 week',
  mensual: '1 month',
};

export default class TareaReporteProgramadoRepository {
  constructor() {
    console.log('Estoy en: TareaReporteProgramadoRepository.constructor()');
  }

  getByProfesionalIdAsync = async (idProfesional) => {
    console.log(`TareaReporteProgramadoRepository.getByProfesionalIdAsync(${idProfesional})`);
    const sql = `SELECT ${TAREA_COLUMNS} FROM tareas_reportes_programados WHERE id_profesional = $1 ORDER BY id DESC`;
    return await BD.query(sql, [idProfesional]);
  };

  getByIdAsync = async (id) => {
    console.log(`TareaReporteProgramadoRepository.getByIdAsync(${id})`);
    const sql = `SELECT ${TAREA_COLUMNS} FROM tareas_reportes_programados WHERE id = $1`;
    return await BD.queryOne(sql, [id]);
  };

  /** Upsert por (id_profesional, id_perteneciente) — guardar de nuevo el formulario actualiza, no duplica. */
  upsertAsync = async ({ id_profesional, id_perteneciente, frecuencia, enviar_automatico, activo }) => {
    console.log(`TareaReporteProgramadoRepository.upsertAsync(${id_profesional}, ${id_perteneciente}, ${frecuencia})`);
    const intervalo = INTERVAL_BY_FRECUENCIA[frecuencia];
    const sql = `
      INSERT INTO tareas_reportes_programados (id_profesional, id_perteneciente, frecuencia, proxima_ejecucion, enviar_automatico, activo)
      VALUES ($1, $2, $3, NOW() + $4::interval, $5, COALESCE($6, true))
      ON CONFLICT (id_profesional, id_perteneciente) DO UPDATE
      SET frecuencia = EXCLUDED.frecuencia,
          enviar_automatico = EXCLUDED.enviar_automatico,
          activo = EXCLUDED.activo,
          proxima_ejecucion = CASE
            WHEN tareas_reportes_programados.frecuencia <> EXCLUDED.frecuencia OR tareas_reportes_programados.activo = false
            THEN EXCLUDED.proxima_ejecucion
            ELSE tareas_reportes_programados.proxima_ejecucion
          END
      RETURNING ${TAREA_COLUMNS}
    `;
    return await BD.queryOne(sql, [id_profesional, id_perteneciente, frecuencia, intervalo, enviar_automatico ?? false, activo]);
  };

  deactivateAsync = async (id, idProfesional) => {
    console.log(`TareaReporteProgramadoRepository.deactivateAsync(${id}, ${idProfesional})`);
    const sql = `UPDATE tareas_reportes_programados SET activo = false WHERE id = $1 AND id_profesional = $2`;
    return await BD.execute(sql, [id, idProfesional]);
  };

  /**
   * Reclama (con lock) las tareas vencidas y adelanta su proxima_ejecucion
   * de una sola vez, dentro de la misma transaccion — asi cada tarea se
   * procesa una unica vez por ciclo aunque la generacion del reporte tarde
   * mas que el intervalo de polling. Si la generacion falla despues, la
   * tarea simplemente espera al proximo ciclo (no reintenta enseguida).
   */
  claimDueAsync = async (limit = 50) => {
    return await BD.transaction(async (client) => {
      const result = await client.query(
        `SELECT id, id_profesional, id_perteneciente, frecuencia, enviar_automatico
         FROM tareas_reportes_programados
         WHERE activo = true AND proxima_ejecucion <= NOW()
         ORDER BY proxima_ejecucion
         LIMIT $1
         FOR UPDATE SKIP LOCKED`,
        [limit],
      );
      if (result.rows.length === 0) return [];

      for (const row of result.rows) {
        const intervalo = INTERVAL_BY_FRECUENCIA[row.frecuencia];
        await client.query(
          `UPDATE tareas_reportes_programados SET proxima_ejecucion = proxima_ejecucion + $2::interval WHERE id = $1`,
          [row.id, intervalo],
        );
      }
      return result.rows;
    });
  };
}
