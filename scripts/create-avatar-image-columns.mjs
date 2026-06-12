import BD from '../src/db/BD.js';
import { envConfig } from '../src/configs/env.config.js';

try {
  await BD.execute(`ALTER TABLE avatares ADD COLUMN IF NOT EXISTS avatar_imagen_url TEXT`);
  await BD.execute(`ALTER TABLE avatares ADD COLUMN IF NOT EXISTS avatar_imagen_path TEXT`);
  await BD.execute(`ALTER TABLE avatares ADD COLUMN IF NOT EXISTS avatar_imagen_content_type TEXT`);
  await BD.execute(`ALTER TABLE avatares ADD COLUMN IF NOT EXISTS avatar_imagen_actualizada_en TIMESTAMPTZ`);
  await BD.execute(`ALTER TABLE avatares ADD COLUMN IF NOT EXISTS avatar_imagen_origen_url TEXT`);
  await BD.execute(`CREATE INDEX IF NOT EXISTS idx_avatares_avatar_imagen_path ON avatares (avatar_imagen_path)`);

  await BD.execute(
    `
      INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
      VALUES ($1, $1, true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/jpg'])
      ON CONFLICT (id) DO UPDATE
      SET public = true,
          allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg']
    `,
    [envConfig.supabaseAvatarBucket],
  );

  console.log('Columnas de cache de imagen de avatar listas.');
  process.exit(0);
} catch (error) {
  console.error('No se pudo preparar el cache de imagen de avatar:', error.message);
  process.exit(1);
}
