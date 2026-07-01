import BD from '../src/db/BD.js';
try {
  await BD.execute(`CREATE TABLE IF NOT EXISTS recordatorios_programados (id SERIAL PRIMARY KEY,id_usuario INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,source_type VARCHAR(30) NOT NULL,routine_id VARCHAR(120) NOT NULL,item_id VARCHAR(120) NOT NULL,titulo VARCHAR(200) NOT NULL,occurrence_at TIMESTAMPTZ NOT NULL,offset_minutes INTEGER NOT NULL,scheduled_at TIMESTAMPTZ NOT NULL,status VARCHAR(20) NOT NULL DEFAULT 'pending',processed_at TIMESTAMPTZ,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),UNIQUE(id_usuario,source_type,item_id,occurrence_at,offset_minutes)); CREATE INDEX IF NOT EXISTS idx_recordatorios_due ON recordatorios_programados(status,scheduled_at);`);
  console.log('Tabla recordatorios_programados lista'); process.exit(0);
} catch(error) { console.error(error.message); process.exit(1); }
