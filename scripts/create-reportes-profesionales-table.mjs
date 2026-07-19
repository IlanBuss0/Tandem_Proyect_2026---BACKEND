import BD from '../src/db/BD.js';

(async () => {
  try {
    await BD.execute(`
      CREATE TABLE IF NOT EXISTS reportes_profesionales (
        id BIGSERIAL PRIMARY KEY,
        id_profesional INTEGER NOT NULL REFERENCES profesionales(id) ON DELETE CASCADE,
        id_perteneciente INTEGER NOT NULL REFERENCES pertenecientes(id) ON DELETE CASCADE,
        titulo VARCHAR(200) NOT NULL,
        contenido TEXT NOT NULL,
        id_tipo VARCHAR(20) NOT NULL CHECK (id_tipo IN ('manual', 'programado')),
        fecha_generacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        enviado_al_tutor BOOLEAN NOT NULL DEFAULT FALSE,
        fecha_envio TIMESTAMPTZ NULL
      )
    `);
    await BD.execute(`CREATE INDEX IF NOT EXISTS idx_reportes_profesionales_profesional ON reportes_profesionales(id_profesional)`);
    await BD.execute(`CREATE INDEX IF NOT EXISTS idx_reportes_profesionales_perteneciente ON reportes_profesionales(id_perteneciente)`);
    console.log('Tabla reportes_profesionales lista.');
    process.exit(0);
  } catch (error) {
    console.error('No se pudo crear la tabla reportes_profesionales:', error.message);
    process.exit(1);
  }
})();
