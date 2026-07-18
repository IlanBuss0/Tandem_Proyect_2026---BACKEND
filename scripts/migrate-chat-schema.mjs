import BD from '../src/db/BD.js';

async function main() {
  await BD.execute(`ALTER TABLE chats ADD COLUMN IF NOT EXISTS descripcion TEXT`);
  await BD.execute(`ALTER TABLE chats ADD COLUMN IF NOT EXISTS avatar_url TEXT`);
  await BD.execute(`ALTER TABLE chats ADD COLUMN IF NOT EXISTS avatar_path TEXT`);
  await BD.execute(`ALTER TABLE chats ADD COLUMN IF NOT EXISTS avatar_content_type TEXT`);
  await BD.execute(`ALTER TABLE chats ADD COLUMN IF NOT EXISTS avatar_actualizada_en TIMESTAMP`);
  await BD.execute(`ALTER TABLE chats ADD COLUMN IF NOT EXISTS actualizado_en TIMESTAMP`);
  await BD.execute(`UPDATE chats SET actualizado_en = COALESCE(actualizado_en, fecha_creacion, NOW()) WHERE actualizado_en IS NULL`);

  await BD.execute(`ALTER TABLE mensajes ADD COLUMN IF NOT EXISTS fecha_edicion TIMESTAMPTZ`);
  await BD.execute(`ALTER TABLE mensajes ADD COLUMN IF NOT EXISTS fecha_eliminacion TIMESTAMPTZ`);

  await BD.execute(`ALTER TABLE participantes_chats ADD COLUMN IF NOT EXISTS ultimo_mensaje_leido_id INT REFERENCES mensajes(id)`);
  await BD.execute(`ALTER TABLE participantes_chats ADD COLUMN IF NOT EXISTS fecha_ultima_lectura TIMESTAMP`);
  await BD.execute(`ALTER TABLE participantes_chats ADD COLUMN IF NOT EXISTS oculto_desde TIMESTAMP`);
  await BD.execute(`ALTER TABLE participantes_chats ADD COLUMN IF NOT EXISTS es_admin BOOLEAN DEFAULT false`);

  await BD.execute(`ALTER TABLE archivos ADD COLUMN IF NOT EXISTS content_type TEXT`);
  await BD.execute(`ALTER TABLE archivos ADD COLUMN IF NOT EXISTS peso_bytes INTEGER`);

  await BD.execute(`CREATE INDEX IF NOT EXISTS idx_mensajes_chat_id ON mensajes (id_chat, id)`);
  await BD.execute(`CREATE INDEX IF NOT EXISTS idx_mensajes_chat_fecha_envio ON mensajes (id_chat, fecha_envio)`);
  await BD.execute(`CREATE INDEX IF NOT EXISTS idx_mensajes_chat_fecha_edicion ON mensajes (id_chat, fecha_edicion)`);
  await BD.execute(`CREATE INDEX IF NOT EXISTS idx_mensajes_chat_fecha_eliminacion ON mensajes (id_chat, fecha_eliminacion)`);
  await BD.execute(`CREATE INDEX IF NOT EXISTS idx_participantes_chats_sync ON participantes_chats (id_chat, fecha_ingreso, fecha_salida, fecha_ultima_lectura)`);
  await BD.execute(`CREATE INDEX IF NOT EXISTS idx_chats_actualizado_en ON chats (actualizado_en)`);

  await BD.execute(`
    INSERT INTO tipos_chats (nombre, orden)
    SELECT 'grupo', 20
    WHERE NOT EXISTS (
      SELECT 1
      FROM tipos_chats
      WHERE LOWER(nombre) IN ('grupo', 'grupal', 'group')
    )
  `);

  await BD.execute(`
    WITH grupos_sin_admin AS (
      SELECT id_chat
      FROM participantes_chats
      WHERE fecha_salida IS NULL
      GROUP BY id_chat
      HAVING COUNT(*) > 2 AND BOOL_OR(COALESCE(es_admin, false)) = false
    ),
    primer_participante AS (
      SELECT DISTINCT ON (pc.id_chat) pc.id
      FROM participantes_chats pc
      INNER JOIN grupos_sin_admin g ON g.id_chat = pc.id_chat
      WHERE pc.fecha_salida IS NULL
      ORDER BY pc.id_chat, pc.id ASC
    )
    UPDATE participantes_chats pc
    SET es_admin = true
    FROM primer_participante pp
    WHERE pc.id = pp.id
  `);

  console.log('Migracion de esquema de chat OK');
}

try {
  await main();
} finally {
  await BD.pool.end();
}
