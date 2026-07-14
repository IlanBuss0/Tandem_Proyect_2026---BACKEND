import BD from '../src/db/BD.js';

(async () => {
  try {
    await BD.execute(`
      ALTER TABLE sesiones_profesionales
        ADD COLUMN IF NOT EXISTS titulo VARCHAR(160) NOT NULL DEFAULT 'Sesion profesional',
        ADD COLUMN IF NOT EXISTS duracion_minutos INTEGER NOT NULL DEFAULT 60,
        ADD COLUMN IF NOT EXISTS estado VARCHAR(24) NOT NULL DEFAULT 'programada',
        ADD COLUMN IF NOT EXISTS recordatorios JSONB NOT NULL DEFAULT '[]'::jsonb,
        ADD COLUMN IF NOT EXISTS legacy_calendar_event_id VARCHAR(120),
        ADD COLUMN IF NOT EXISTS recurrence_group_id UUID,
        ADD COLUMN IF NOT EXISTS recurrence_rule JSONB,
        ADD COLUMN IF NOT EXISTS recurrence_index INTEGER NOT NULL DEFAULT 0
    `);
    await BD.execute(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_sesiones_profesionales_legacy_event
      ON sesiones_profesionales (legacy_calendar_event_id)
      WHERE legacy_calendar_event_id IS NOT NULL
    `);
    await BD.execute(`
      CREATE TABLE IF NOT EXISTS notas_privadas_profesionales (
        id SERIAL PRIMARY KEY,
        id_sesion_profesional INTEGER NOT NULL UNIQUE REFERENCES sesiones_profesionales(id) ON DELETE CASCADE,
        id_profesional INTEGER NOT NULL REFERENCES profesionales(id) ON DELETE CASCADE,
        contenido JSONB NOT NULL DEFAULT '{"type":"doc","content":[]}'::jsonb,
        version INTEGER NOT NULL DEFAULT 1,
        fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await BD.execute(`
      CREATE TABLE IF NOT EXISTS documentos_drive_notas (
        id SERIAL PRIMARY KEY,
        id_nota_privada INTEGER NOT NULL UNIQUE REFERENCES notas_privadas_profesionales(id) ON DELETE CASCADE,
        google_file_id VARCHAR(255) NOT NULL,
        nombre VARCHAR(255) NOT NULL,
        mime_type VARCHAR(160) NOT NULL,
        web_view_url TEXT NOT NULL,
        fecha_vinculacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await BD.execute(`
      INSERT INTO notas_privadas_profesionales (id_sesion_profesional, id_profesional, contenido)
      SELECT s.id, s.id_profesional,
        jsonb_build_object(
          'type', 'doc',
          'content', jsonb_build_array(
            jsonb_build_object(
              'type', 'paragraph',
              'content', jsonb_build_array(
                jsonb_build_object('type', 'text', 'text', CONCAT_WS(E'\n\n', s.nota_sesion, s.recomendacion))
              )
            )
          )
        )
      FROM sesiones_profesionales s
      WHERE (NULLIF(TRIM(s.nota_sesion), '') IS NOT NULL OR NULLIF(TRIM(s.recomendacion), '') IS NOT NULL)
      ON CONFLICT (id_sesion_profesional) DO NOTHING
    `);
    await BD.execute(`
      ALTER TABLE perfiles_profesionales
        ADD COLUMN IF NOT EXISTS modalidad VARCHAR(80),
        ADD COLUMN IF NOT EXISTS disponibilidad VARCHAR(255),
        ADD COLUMN IF NOT EXISTS correo_contacto VARCHAR(255),
        ADD COLUMN IF NOT EXISTS whatsapp_contacto VARCHAR(32),
        ADD COLUMN IF NOT EXISTS publicar_correo BOOLEAN NOT NULL DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS publicar_whatsapp BOOLEAN NOT NULL DEFAULT FALSE
    `);

    const legacyConfigs = await BD.query(`
      SELECT c.clave, c.valor, p.id AS id_profesional
      FROM configuraciones_usuarios c
      JOIN profesionales p ON p.id_usuario = c.id_usuario
      WHERE c.clave = 'calendar.events' OR c.clave LIKE 'calendar.event:%'
    `);
    const pertenecienteByUser = new Map();
    let migratedSessions = 0;

    for (const config of legacyConfigs) {
      let parsed;
      try {
        parsed = typeof config.valor === 'string' ? JSON.parse(config.valor) : config.valor;
      } catch {
        console.warn(`Se omitio una configuracion de calendario invalida: ${config.clave}`);
        continue;
      }

      const events = Array.isArray(parsed) ? parsed : [parsed];
      for (const event of events) {
        if (!event || event.type !== 'terapia' || !event.date) continue;
        const patientUserId = String(event.description || '').match(/\[paciente:([^\]]+)\]/)?.[1];
        if (!patientUserId) continue;

        if (!pertenecienteByUser.has(patientUserId)) {
          const belonging = await BD.queryOne(
            'SELECT id FROM pertenecientes WHERE id_usuario = $1',
            [patientUserId],
          );
          pertenecienteByUser.set(patientUserId, belonging?.id || null);
        }
        const idPerteneciente = pertenecienteByUser.get(patientUserId);
        if (!idPerteneciente) continue;

        const time = /^\d{2}:\d{2}/.test(String(event.time || '')) ? String(event.time).slice(0, 5) : '09:00';
        const startsAt = `${event.date}T${time}:00`;
        const legacyId = `calendar:${config.id_profesional}:${event.id || config.clave}`;
        const inserted = await BD.execute(`
          INSERT INTO sesiones_profesionales (
            id_profesional, id_perteneciente, fecha_hora, titulo,
            duracion_minutos, estado, recordatorios, legacy_calendar_event_id
          ) VALUES ($1, $2, $3, $4, $5, 'programada', $6::jsonb, $7)
          ON CONFLICT (legacy_calendar_event_id) WHERE legacy_calendar_event_id IS NOT NULL DO NOTHING
        `, [
          config.id_profesional,
          idPerteneciente,
          startsAt,
          String(event.title || 'Sesion profesional').slice(0, 160),
          Number.isInteger(event.durationMinutes) && event.durationMinutes > 0 ? event.durationMinutes : 60,
          JSON.stringify(Array.isArray(event.reminders) ? event.reminders : []),
          legacyId.slice(0, 120),
        ]);
        migratedSessions += inserted;
      }
    }

    if (migratedSessions > 0) {
      console.log(`Sesiones antiguas migradas desde calendario: ${migratedSessions}`);
    }
    console.log('Nucleo profesional actualizado correctamente.');
    process.exit(0);
  } catch (error) {
    console.error('No se pudo actualizar el nucleo profesional:', error.message);
    process.exit(1);
  }
})();
