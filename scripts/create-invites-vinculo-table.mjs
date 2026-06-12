import BD from '../src/db/BD.js';

const sql = `
  CREATE TABLE IF NOT EXISTS invites_vinculo (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(9) NOT NULL UNIQUE,
    token VARCHAR(64) NOT NULL UNIQUE,
    id_tutor_creador INTEGER NOT NULL REFERENCES tutores(id),
    estado VARCHAR(20) NOT NULL DEFAULT 'activo',
    fecha_expiracion TIMESTAMP NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_uso TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_invites_vinculo_codigo ON invites_vinculo(codigo);
  CREATE INDEX IF NOT EXISTS idx_invites_vinculo_token ON invites_vinculo(token);
  CREATE INDEX IF NOT EXISTS idx_invites_vinculo_tutor ON invites_vinculo(id_tutor_creador);
`;

try {
  await BD.query(sql);
  console.log('Tabla invites_vinculo creada correctamente.');
} catch (error) {
  console.error('Error creando tabla invites_vinculo:', error.message);
}

process.exit(0);
