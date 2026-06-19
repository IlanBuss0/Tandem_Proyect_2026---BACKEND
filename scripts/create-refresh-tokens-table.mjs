import BD from '../src/db/BD.js';

const sql = `
  CREATE TABLE IF NOT EXISTS refresh_tokens (
    id SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    family_id UUID NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP,
    replaced_by_token_hash VARCHAR(64)
  );

  CREATE INDEX IF NOT EXISTS idx_refresh_tokens_usuario ON refresh_tokens(id_usuario);
  CREATE INDEX IF NOT EXISTS idx_refresh_tokens_family ON refresh_tokens(family_id);
  CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
  CREATE INDEX IF NOT EXISTS idx_refresh_tokens_replaced_by ON refresh_tokens(replaced_by_token_hash);
`;

try {
  await BD.query(sql);
  console.log('Tabla refresh_tokens creada correctamente.');
} catch (error) {
  console.error('Error creando tabla refresh_tokens:', error.message);
}

process.exit(0);
