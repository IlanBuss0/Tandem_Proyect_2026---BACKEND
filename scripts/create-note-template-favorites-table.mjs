import BD from '../src/db/BD.js';

(async () => {
  try {
    await BD.execute(`
      CREATE TABLE IF NOT EXISTS favoritos_plantillas_notas (
        id BIGSERIAL PRIMARY KEY,
        id_profesional INTEGER NOT NULL REFERENCES profesionales(id) ON DELETE CASCADE,
        template_id VARCHAR(60) NOT NULL,
        fecha_marcado TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT uq_favoritos_plantillas_profesional_template UNIQUE (id_profesional, template_id)
      )
    `);
    console.log('Tabla favoritos_plantillas_notas lista.');
    process.exit(0);
  } catch (error) {
    console.error('No se pudo crear la tabla favoritos_plantillas_notas:', error.message);
    process.exit(1);
  }
})();
