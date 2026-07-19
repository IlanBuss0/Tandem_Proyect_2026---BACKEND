import BD from '../src/db/BD.js';

(async () => {
  try {
    await BD.execute(`
      CREATE TABLE IF NOT EXISTS tareas_reportes_programados (
        id BIGSERIAL PRIMARY KEY,
        id_profesional INTEGER NOT NULL REFERENCES profesionales(id) ON DELETE CASCADE,
        id_perteneciente INTEGER NOT NULL REFERENCES pertenecientes(id) ON DELETE CASCADE,
        frecuencia VARCHAR(10) NOT NULL CHECK (frecuencia IN ('diario', 'semanal', 'mensual')),
        proxima_ejecucion TIMESTAMPTZ NOT NULL,
        enviar_automatico BOOLEAN NOT NULL DEFAULT FALSE,
        activo BOOLEAN NOT NULL DEFAULT TRUE,
        fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT uq_tareas_reportes_profesional_perteneciente UNIQUE (id_profesional, id_perteneciente)
      )
    `);
    await BD.execute(`
      CREATE INDEX IF NOT EXISTS idx_tareas_reportes_due ON tareas_reportes_programados(activo, proxima_ejecucion) WHERE activo = TRUE
    `);
    console.log('Tabla tareas_reportes_programados lista.');
    process.exit(0);
  } catch (error) {
    console.error('No se pudo crear la tabla tareas_reportes_programados:', error.message);
    process.exit(1);
  }
})();
