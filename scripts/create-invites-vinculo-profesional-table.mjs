import BD from '../src/db/BD.js';

const sql = `
  CREATE TABLE IF NOT EXISTS invites_vinculo_profesional (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(9) NOT NULL UNIQUE,
    token VARCHAR(64) NOT NULL UNIQUE,
    id_tutor_creador INTEGER NOT NULL REFERENCES tutores(id),
    id_perteneciente INTEGER NOT NULL REFERENCES pertenecientes(id),
    estado VARCHAR(20) NOT NULL DEFAULT 'activo',
    fecha_expiracion TIMESTAMP NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_uso TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_invites_vinculo_profesional_codigo ON invites_vinculo_profesional(codigo);
  CREATE INDEX IF NOT EXISTS idx_invites_vinculo_profesional_token ON invites_vinculo_profesional(token);
  CREATE INDEX IF NOT EXISTS idx_invites_vinculo_profesional_tutor ON invites_vinculo_profesional(id_tutor_creador);
  CREATE INDEX IF NOT EXISTS idx_invites_vinculo_profesional_perteneciente ON invites_vinculo_profesional(id_perteneciente);
`;

try {
  await BD.query(sql);
  console.log('Tabla invites_vinculo_profesional creada correctamente.');
} catch (error) {
  console.error('Error creando tabla invites_vinculo_profesional:', error.message);
}

process.exit(0);
