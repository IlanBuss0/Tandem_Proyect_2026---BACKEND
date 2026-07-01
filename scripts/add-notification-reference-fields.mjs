import BD from '../src/db/BD.js';

(async () => {
  try {
    await BD.execute(`
      ALTER TABLE notificaciones
      ADD COLUMN IF NOT EXISTS reference_type VARCHAR(50),
      ADD COLUMN IF NOT EXISTS reference_id INTEGER,
      ADD COLUMN IF NOT EXISTS context_user_id INTEGER REFERENCES usuarios(id)
    `);
    await BD.execute(`
      UPDATE notificaciones n
      SET context_user_id = COALESCE(
        (SELECT p.id_usuario FROM pertenecientes p WHERE p.id_usuario = n.id_usuario_actor),
        (SELECT p.id_usuario FROM pertenecientes p WHERE p.id_usuario = n.id_usuario_destino)
      )
      WHERE n.context_user_id IS NULL
        AND (EXISTS (SELECT 1 FROM pertenecientes p WHERE p.id_usuario = n.id_usuario_actor)
          OR EXISTS (SELECT 1 FROM pertenecientes p WHERE p.id_usuario = n.id_usuario_destino))
    `);
    await BD.execute(`
      UPDATE notificaciones n
      SET reference_type = 'chat',
          reference_id = (
            SELECT m.id_chat
            FROM mensajes m
            INNER JOIN participantes_chats pc
              ON pc.id_chat = m.id_chat
             AND pc.id_usuario = n.id_usuario_destino
            WHERE m.id_usuario_emisor = n.id_usuario_actor
              AND m.fecha_envio <= n.fecha_creacion + INTERVAL '2 minutes'
              AND m.fecha_envio >= n.fecha_creacion - INTERVAL '2 minutes'
            ORDER BY ABS(EXTRACT(EPOCH FROM (m.fecha_envio - n.fecha_creacion))) ASC, m.id DESC
            LIMIT 1
          )
      WHERE n.reference_id IS NULL
        AND (
          LOWER(n.titulo) LIKE '%mensaje%'
          OR n.id_tipo_notificacion IN (
            SELECT id FROM tipos_notificaciones WHERE LOWER(nombre) = 'chat'
          )
        )
        AND EXISTS (
          SELECT 1
          FROM mensajes m
          INNER JOIN participantes_chats pc
            ON pc.id_chat = m.id_chat
           AND pc.id_usuario = n.id_usuario_destino
          WHERE m.id_usuario_emisor = n.id_usuario_actor
            AND m.fecha_envio <= n.fecha_creacion + INTERVAL '2 minutes'
            AND m.fecha_envio >= n.fecha_creacion - INTERVAL '2 minutes'
        )
    `);
    console.log('Columnas reference_type y reference_id agregadas a notificaciones OK');
    process.exit(0);
  } catch (e) {
    console.error('Error agregando columnas:', e.message);
    process.exit(1);
  }
})();
