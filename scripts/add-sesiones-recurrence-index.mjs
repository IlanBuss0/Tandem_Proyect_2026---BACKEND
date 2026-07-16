import BD from '../src/db/BD.js';

(async () => {
  try {
    await BD.execute(`
      CREATE INDEX IF NOT EXISTS idx_sesiones_profesionales_recurrence_group
      ON sesiones_profesionales (recurrence_group_id)
      WHERE recurrence_group_id IS NOT NULL
    `);
    await BD.execute(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_sesiones_profesionales_recurrence_index
      ON sesiones_profesionales (recurrence_group_id, recurrence_index)
      WHERE recurrence_group_id IS NOT NULL
    `);
    console.log('Indices de recurrencia de sesiones profesionales creados correctamente.');
    process.exit(0);
  } catch (error) {
    console.error('No se pudieron crear los indices de recurrencia:', error.message);
    process.exit(1);
  }
})();
