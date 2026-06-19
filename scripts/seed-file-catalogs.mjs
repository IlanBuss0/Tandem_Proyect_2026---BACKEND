import BD from '../src/db/BD.js';

const TIPOS_ARCHIVO = [
  'Imagen',
  'Documento',
  'Audio',
  'Video',
  'Otro',
];

async function seedTable(tableName, items) {
  let inserted = 0;
  for (const [index, nombre] of items.entries()) {
    const result = await BD.queryOne(
      `
        INSERT INTO ${tableName} (nombre, orden)
        SELECT $1::text, $2::int
        WHERE NOT EXISTS (
          SELECT 1 FROM ${tableName}
          WHERE LOWER(nombre) = LOWER($1::text)
        )
        RETURNING id
      `,
      [nombre, (index + 1) * 10],
    );
    if (result?.id) inserted += 1;
  }
  return inserted;
}

try {
  const inserted = await seedTable('tipos_archivos', TIPOS_ARCHIVO);
  console.log(JSON.stringify({ ok: true, inserted: { tipos_archivos: inserted } }, null, 2));
} finally {
  await BD.pool.end();
}
