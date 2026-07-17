import BD from '../src/db/BD.js';

(async () => {
  try {
    await BD.execute(`
      ALTER TABLE sesiones_profesionales
        ADD COLUMN IF NOT EXISTS motivo_cancelacion VARCHAR(240)
    `);
    console.log('Columna motivo_cancelacion lista en sesiones_profesionales.');
    process.exit(0);
  } catch (error) {
    console.error('No se pudo agregar motivo_cancelacion:', error.message);
    process.exit(1);
  }
})();
