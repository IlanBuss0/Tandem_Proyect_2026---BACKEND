import BD from '../src/db/BD.js';

(async () => {
  try {
    await BD.execute(`
      ALTER TABLE configuraciones_usuarios
        ALTER COLUMN valor TYPE TEXT;
      ALTER TABLE configuraciones_accesibilidad
        ALTER COLUMN valor TYPE TEXT;
    `);
    console.log('Columnas valor ampliadas a TEXT correctamente');
    process.exit(0);
  } catch (error) {
    console.error('Error ampliando columnas valor:', error.message);
    process.exit(1);
  }
})();
