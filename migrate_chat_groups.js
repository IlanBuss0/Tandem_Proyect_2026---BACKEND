import BD from './src/db/BD.js';

(async () => {
  try {
    await BD.execute('ALTER TABLE chats ADD COLUMN IF NOT EXISTS descripcion TEXT');
    await BD.execute(`
      INSERT INTO tipos_chats (nombre, orden)
      SELECT 'grupo', 20
      WHERE NOT EXISTS (SELECT 1 FROM tipos_chats WHERE LOWER(nombre) IN ('grupo', 'grupal', 'group'))
    `);
    console.log('Migracion chat groups OK');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
