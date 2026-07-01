import BD from '../src/db/BD.js';

(async () => {
  try {
    await BD.execute(`
      ALTER TABLE notificaciones
      ADD COLUMN IF NOT EXISTS reference_type VARCHAR(50),
      ADD COLUMN IF NOT EXISTS reference_id INTEGER
    `);
    console.log('Columnas reference_type y reference_id agregadas a notificaciones OK');
    process.exit(0);
  } catch (e) {
    console.error('Error agregando columnas:', e.message);
    process.exit(1);
  }
})();
