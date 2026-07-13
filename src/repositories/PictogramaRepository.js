import BD from '../db/BD.js';

const POPULAR_TITLES = [
  'comer',
  'beber',
  'agua',
  'ir al bano',
  'bano',
  'lavarse las manos',
  'dolor',
  'ayuda',
  'si',
  'no',
  'contento',
  'triste',
  'enfadado',
  'miedo',
  'cansado',
  'familia',
  'mamá',
  'papá',
  'casa',
  'escuela',
  'dormir',
  'vestirse',
  'jugar',
  'leer',
  'escribir',
  'esperar',
  'salir',
  'medico',
  'supermercado',
  'autobus',
];

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function getPopularityScore(pictogram) {
  const title = normalizeText(pictogram?.name);
  const exactIndex = POPULAR_TITLES.findIndex((item) => normalizeText(item) === title);
  if (exactIndex >= 0) return POPULAR_TITLES.length - exactIndex + 100;

  const prefixIndex = POPULAR_TITLES.findIndex((item) => title.startsWith(normalizeText(item)));
  if (prefixIndex >= 0) return POPULAR_TITLES.length - prefixIndex;

  return 0;
}

function normalizeRow(row) {
  if (!row) return null;

  return {
    id: String(row.origen_id || row.arasaac_id || row.id),
    dbId: row.id,
    arasaacId: row.arasaac_id,
    name: row.titulo,
    emoji: '',
    imageUrl: row.url,
    downloadUrl: row.url_descarga || row.url,
    category: row.tipo,
    tags: Array.isArray(row.etiquetas) ? row.etiquetas : [],
    language: row.idioma,
    source: row.origen,
    author: row.autor,
    license: row.licencia,
    popularity: row.popularidad || 0,
    useCount: row.uso_total || 0,
    downloadCount: row.descarga_total || 0,
    savedCount: row.guardado_total || 0,
    syncedAt: row.fecha_sincronizacion,
    targetPertenecienteId: row.id_perteneciente_destino ? Number(row.id_perteneciente_destino) : null,
    status: row.estado_publicacion || 'approved',
  };
}

function buildSearchText(pictogram) {
  return [
    pictogram?.name,
    pictogram?.category,
    ...(Array.isArray(pictogram?.tags) ? pictogram.tags : []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function toDbValues(pictogram) {
  const origen = pictogram.source || 'ARASAAC';
  const origenId = String(pictogram.arasaacId || pictogram.id);
  const metadata = {
    id: pictogram.id,
    favorite: pictogram.favorite || false,
  };

  return [
    origen,
    origenId,
    Number.isFinite(Number(pictogram.arasaacId)) ? Number(pictogram.arasaacId) : null,
    pictogram.name,
    pictogram.category || 'otros',
    pictogram.imageUrl,
    pictogram.downloadUrl || pictogram.imageUrl,
    Array.isArray(pictogram.tags) ? pictogram.tags : [],
    pictogram.language || 'es',
    pictogram.author || null,
    pictogram.license || null,
    buildSearchText(pictogram),
    JSON.stringify(metadata),
    getPopularityScore(pictogram),
  ];
}

export default class PictogramaRepository {
  ensureSchemaAsync = async () => {
    await BD.execute(`
      CREATE TABLE IF NOT EXISTS pictogramas (
        id BIGSERIAL PRIMARY KEY,
        origen TEXT NOT NULL DEFAULT 'ARASAAC',
        origen_id TEXT NOT NULL,
        arasaac_id INTEGER,
        titulo TEXT NOT NULL,
        tipo TEXT NOT NULL DEFAULT 'otros',
        url TEXT NOT NULL,
        url_descarga TEXT,
        etiquetas TEXT[] NOT NULL DEFAULT '{}',
        idioma TEXT NOT NULL DEFAULT 'es',
        autor TEXT,
        licencia TEXT,
        texto_busqueda TEXT NOT NULL DEFAULT '',
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        fecha_sincronizacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT pictogramas_origen_idioma_origen_id_key UNIQUE (origen, idioma, origen_id)
      )
    `);

    await BD.execute(`CREATE INDEX IF NOT EXISTS idx_pictogramas_idioma_tipo ON pictogramas (idioma, tipo)`);
    await BD.execute(`CREATE INDEX IF NOT EXISTS idx_pictogramas_titulo_lower ON pictogramas (LOWER(titulo))`);
    await BD.execute(`CREATE INDEX IF NOT EXISTS idx_pictogramas_etiquetas ON pictogramas USING GIN (etiquetas)`);
    await BD.execute(`ALTER TABLE pictogramas ADD COLUMN IF NOT EXISTS popularidad INTEGER NOT NULL DEFAULT 0`);
    await BD.execute(`ALTER TABLE pictogramas ADD COLUMN IF NOT EXISTS uso_total INTEGER NOT NULL DEFAULT 0`);
    await BD.execute(`ALTER TABLE pictogramas ADD COLUMN IF NOT EXISTS descarga_total INTEGER NOT NULL DEFAULT 0`);
    await BD.execute(`ALTER TABLE pictogramas ADD COLUMN IF NOT EXISTS guardado_total INTEGER NOT NULL DEFAULT 0`);
    await BD.execute(`ALTER TABLE pictogramas ADD COLUMN IF NOT EXISTS id_usuario_creador INTEGER REFERENCES usuarios(id)`);
    await BD.execute(`ALTER TABLE pictogramas ADD COLUMN IF NOT EXISTS id_perteneciente_destino INTEGER REFERENCES pertenecientes(id)`);
    await BD.execute(`ALTER TABLE pictogramas ADD COLUMN IF NOT EXISTS estado_publicacion VARCHAR(30) NOT NULL DEFAULT 'approved'`);
    await BD.execute(`ALTER TABLE pictogramas ADD COLUMN IF NOT EXISTS motivo_revision TEXT`);
    await BD.execute(`ALTER TABLE pictogramas ADD COLUMN IF NOT EXISTS id_administrador_revisor INTEGER REFERENCES usuarios(id)`);
    await BD.execute(`ALTER TABLE pictogramas ADD COLUMN IF NOT EXISTS fecha_revision TIMESTAMPTZ`);
    await BD.execute(`ALTER TABLE pictogramas ADD COLUMN IF NOT EXISTS generacion_ia_id UUID`);
    await BD.execute(`CREATE INDEX IF NOT EXISTS idx_pictogramas_populares ON pictogramas (idioma, popularidad DESC, descarga_total DESC, uso_total DESC, titulo ASC)`);
    await BD.execute(`CREATE INDEX IF NOT EXISTS idx_pictogramas_publicacion ON pictogramas(estado_publicacion, fecha_creacion DESC)`);
    await BD.execute(`CREATE INDEX IF NOT EXISTS idx_pictogramas_generacion_ia ON pictogramas(generacion_ia_id) WHERE generacion_ia_id IS NOT NULL`);

    await BD.execute(`
      CREATE TABLE IF NOT EXISTS favoritos_pictogramas (
        id BIGSERIAL PRIMARY KEY,
        id_usuario TEXT NOT NULL,
        idioma TEXT NOT NULL DEFAULT 'es',
        origen TEXT NOT NULL DEFAULT 'ARASAAC',
        origen_id TEXT NOT NULL,
        fecha_marcado TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT favoritos_pictogramas_usuario_pictograma_key UNIQUE (id_usuario, idioma, origen, origen_id)
      )
    `);
    await BD.execute(`CREATE INDEX IF NOT EXISTS idx_favoritos_pictogramas_usuario ON favoritos_pictogramas (id_usuario, idioma, fecha_marcado DESC)`);
  };

  searchAsync = async ({ search, category, language, limit, targetPertenecienteId }) => {
    const where = ["idioma = $1"];
    if (targetPertenecienteId) {
      const ids = String(targetPertenecienteId).split(',').map(Number).filter(Boolean);
      if (ids.length > 0) {
        where.push(`(origen <> 'TANDEM_AI' OR estado_publicacion = 'approved' OR (estado_publicacion = 'private' AND id_perteneciente_destino = ANY('{${ids.join(',')}}'::int[])))`);
      } else {
        where.push("(origen <> 'TANDEM_AI' OR estado_publicacion = 'approved')");
      }
    } else {
      where.push("(origen <> 'TANDEM_AI' OR estado_publicacion = 'approved')");
    }
    const params = [language];
    const categories = String(category || '')
      .split(',')
      .map((item) => item.trim().toLowerCase())
      .filter((item) => item && item !== 'todas');
    const searchText = String(search || '').trim().toLowerCase();
    let orderBy = `
      (popularidad + descarga_total + uso_total + guardado_total) DESC,
      popularidad DESC,
      titulo ASC
    `;

    if (categories.length > 0) {
      params.push(categories);
      where.push(`tipo = ANY($${params.length})`);
    }

    if (searchText) {
      params.push(`%${searchText}%`);
      const index = params.length;
      where.push(`(
        LOWER(titulo) LIKE $${index}
        OR LOWER(texto_busqueda) LIKE $${index}
        OR EXISTS (
          SELECT 1
          FROM unnest(etiquetas) AS etiqueta
          WHERE LOWER(etiqueta) LIKE $${index}
        )
      )`);
      params.push(searchText);
      const exactIndex = params.length;
      params.push(`${searchText}%`);
      const prefixIndex = params.length;
      orderBy = `
        CASE
          WHEN LOWER(titulo) = $${exactIndex} THEN 0
          WHEN LOWER(titulo) LIKE $${prefixIndex} THEN 1
          WHEN LOWER(titulo) LIKE $${index} THEN 2
          ELSE 3
        END,
        titulo ASC
      `;
    }

    const shouldDeduplicateDefaults = !searchText && categories.length === 0;
    const queryLimit = shouldDeduplicateDefaults ? limit * 3 : limit;
    params.push(queryLimit);
    const sql = `
      SELECT id, origen, origen_id, arasaac_id, titulo, tipo, url, url_descarga,
             etiquetas, idioma, autor, licencia, popularidad, uso_total, descarga_total,
             guardado_total, fecha_sincronizacion, id_perteneciente_destino, estado_publicacion
      FROM pictogramas
      WHERE ${where.join(' AND ')}
      ORDER BY ${orderBy}
      LIMIT $${params.length}
    `;

    const rows = await BD.query(sql, params);
    const normalizedRows = rows.map(normalizeRow);

    if (!shouldDeduplicateDefaults) return normalizedRows;

    const seen = new Set();
    return normalizedRows
      .filter((pictogram) => {
        const key = normalizeText(pictogram.name);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, limit);
  };

  getByExternalIdAsync = async (id, language) => {
    const sql = `
      SELECT id, origen, origen_id, arasaac_id, titulo, tipo, url, url_descarga,
             etiquetas, idioma, autor, licencia, popularidad, uso_total, descarga_total,
             guardado_total, fecha_sincronizacion
      FROM pictogramas
      WHERE idioma = $1
        AND (origen_id = $2 OR arasaac_id::TEXT = $2)
        AND (origen <> 'TANDEM_AI' OR estado_publicacion = 'approved')
      LIMIT 1
    `;
    return normalizeRow(await BD.queryOne(sql, [language, String(id)]));
  };

  getByExternalIdForUserAsync = async (id, language, userId) => {
    const sql = `
      SELECT p.id, p.origen, p.origen_id, p.arasaac_id, p.titulo, p.tipo, p.url, p.url_descarga,
             p.etiquetas, p.idioma, p.autor, p.licencia, p.popularidad, p.uso_total,
             p.descarga_total, p.guardado_total, p.fecha_sincronizacion,
             p.id_perteneciente_destino, p.estado_publicacion
      FROM pictogramas p
      WHERE p.idioma = $1
        AND (p.origen_id = $2 OR p.arasaac_id::TEXT = $2)
        AND (
          p.origen <> 'TANDEM_AI'
          OR p.estado_publicacion = 'approved'
          OR (
            p.estado_publicacion = 'private'
            AND p.id_perteneciente_destino IN (
              SELECT id FROM pertenecientes WHERE id_usuario = $3
            )
          )
        )
      LIMIT 1
    `;
    return normalizeRow(await BD.queryOne(sql, [language, String(id), Number(userId)]));
  };

  countAsync = async (language) => {
    const row = await BD.queryOne("SELECT COUNT(*)::INTEGER AS total FROM pictogramas WHERE idioma = $1 AND (origen <> 'TANDEM_AI' OR estado_publicacion = 'approved')", [language]);
    return row?.total || 0;
  };

  getCategoriesAsync = async (language) => {
    const rows = await BD.query(
      `
        SELECT tipo, COUNT(*)::INTEGER AS total
        FROM pictogramas
        WHERE idioma = $1 AND (origen <> 'TANDEM_AI' OR estado_publicacion = 'approved')
        GROUP BY tipo
        ORDER BY tipo ASC
      `,
      [language],
    );

    return rows.map((row) => ({ id: row.tipo, name: row.tipo, total: row.total }));
  };

  incrementDownloadAsync = async (id, language) => {
    return await BD.execute(
      `
        UPDATE pictogramas
        SET descarga_total = descarga_total + 1,
            fecha_actualizacion = NOW()
        WHERE idioma = $1 AND (origen_id = $2 OR arasaac_id::TEXT = $2)
      `,
      [language, String(id)],
    );
  };

  incrementSavedAsync = async (id, language) => {
    return await BD.execute(
      `
        UPDATE pictogramas
        SET guardado_total = guardado_total + 1,
            fecha_actualizacion = NOW()
        WHERE idioma = $1 AND (origen_id = $2 OR arasaac_id::TEXT = $2)
      `,
      [language, String(id)],
    );
  };

  decrementSavedAsync = async (id, language) => {
    return await BD.execute(
      `
        UPDATE pictogramas
        SET guardado_total = GREATEST(guardado_total - 1, 0),
            fecha_actualizacion = NOW()
        WHERE idioma = $1 AND (origen_id = $2 OR arasaac_id::TEXT = $2)
      `,
      [language, String(id)],
    );
  };

  getFavoritesByUserAsync = async (userId, language) => {
    const sql = `
      SELECT p.id, p.origen, p.origen_id, p.arasaac_id, p.titulo, p.tipo, p.url, p.url_descarga,
             p.etiquetas, p.idioma, p.autor, p.licencia, p.popularidad, p.uso_total,
             p.descarga_total, p.guardado_total, p.fecha_sincronizacion
      FROM favoritos_pictogramas fp
      INNER JOIN pictogramas p
        ON p.origen = fp.origen
       AND p.origen_id = fp.origen_id
       AND p.idioma = fp.idioma
      WHERE fp.id_usuario = $1 AND fp.idioma = $2
      ORDER BY fp.fecha_marcado DESC
    `;

    const rows = await BD.query(sql, [String(userId), language]);
    return rows.map(normalizeRow);
  };

  addFavoriteAsync = async ({ userId, pictogramId, language }) => {
    const pictogram = await this.getByExternalIdForUserAsync(pictogramId, language, userId);
    if (!pictogram) return 0;

    const row = await BD.queryOne(
      `
        INSERT INTO favoritos_pictogramas (id_usuario, idioma, origen, origen_id)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id_usuario, idioma, origen, origen_id) DO NOTHING
        RETURNING id
      `,
      [String(userId), language, pictogram.source || 'ARASAAC', String(pictogram.arasaacId || pictogram.id)],
    );

    if (row?.id) {
      await this.incrementSavedAsync(pictogramId, language);
      return row.id;
    }

    return 0;
  };

  removeFavoriteAsync = async ({ userId, pictogramId, language }) => {
    const pictogram = await this.getByExternalIdForUserAsync(pictogramId, language, userId);
    if (!pictogram) return 0;

    const rows = await BD.execute(
      `
        DELETE FROM favoritos_pictogramas
        WHERE id_usuario = $1 AND idioma = $2 AND origen = $3 AND origen_id = $4
      `,
      [String(userId), language, pictogram.source || 'ARASAAC', String(pictogram.arasaacId || pictogram.id)],
    );

    if (rows > 0) {
      await this.decrementSavedAsync(pictogramId, language);
    }

    return rows;
  };

  upsertManyAsync = async (pictograms) => {
    const items = (Array.isArray(pictograms) ? pictograms : []).filter((pictogram) => pictogram?.id && pictogram?.name && pictogram?.imageUrl);
    if (items.length === 0) return 0;

    return await BD.transaction(async (client) => {
      let affected = 0;
      const batchSize = 500;

      for (let offset = 0; offset < items.length; offset += batchSize) {
        const batch = items.slice(offset, offset + batchSize);
        const values = [];
        const rowsSql = batch.map((pictogram, index) => {
          values.push(...toDbValues(pictogram));
          const base = index * 14;
          return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9}, $${base + 10}, $${base + 11}, $${base + 12}, $${base + 13}::jsonb, $${base + 14})`;
        });
        const result = await client.query(
          `
            INSERT INTO pictogramas (
              origen, origen_id, arasaac_id, titulo, tipo, url, url_descarga,
              etiquetas, idioma, autor, licencia, texto_busqueda, metadata, popularidad
            )
            VALUES ${rowsSql.join(', ')}
            ON CONFLICT (origen, idioma, origen_id)
            DO UPDATE SET
              arasaac_id = EXCLUDED.arasaac_id,
              titulo = EXCLUDED.titulo,
              tipo = EXCLUDED.tipo,
              url = EXCLUDED.url,
              url_descarga = EXCLUDED.url_descarga,
              etiquetas = EXCLUDED.etiquetas,
              autor = EXCLUDED.autor,
              licencia = EXCLUDED.licencia,
              texto_busqueda = EXCLUDED.texto_busqueda,
              metadata = EXCLUDED.metadata,
              popularidad = EXCLUDED.popularidad,
              fecha_sincronizacion = NOW(),
              fecha_actualizacion = NOW()
          `,
          values,
        );
        affected += result.rowCount;
      }

      return affected;
    });
  };
}
