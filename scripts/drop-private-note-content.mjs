import BD from '../src/db/BD.js';

// Cumple la decision deliberada de diseño: el backend nunca guarda el
// contenido de las notas clinicas, solo la referencia al documento de
// Google Drive (documentos_drive_notas). Este script purga lo que haya
// quedado guardado por el codigo viejo antes de este cambio.
(async () => {
  try {
    await BD.execute(`
      DELETE FROM notas_privadas_profesionales n
      WHERE NOT EXISTS (
        SELECT 1 FROM documentos_drive_notas d WHERE d.id_nota_privada = n.id
      )
    `);

    await BD.execute(`
      ALTER TABLE notas_privadas_profesionales
        DROP COLUMN IF EXISTS contenido,
        DROP COLUMN IF EXISTS version
    `);

    await BD.execute(`
      ALTER TABLE sesiones_profesionales
        DROP COLUMN IF EXISTS nota_sesion,
        DROP COLUMN IF EXISTS recomendacion
    `);

    console.log('Contenido de notas clinicas eliminado del backend. Solo quedan referencias a Drive.');
    process.exit(0);
  } catch (error) {
    console.error('No se pudo limpiar el contenido de notas privadas:', error.message);
    process.exit(1);
  }
})();
