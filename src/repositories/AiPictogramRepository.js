import BD from '../db/BD.js';

function mapGeneration(row) {
  if (!row) return null;
  return {
    id: row.id,
    creatorUserId: row.id_usuario_creador,
    targetPertenecienteId: row.id_perteneciente_destino,
    name: row.nombre,
    description: row.descripcion,
    category: row.categoria,
    mode: row.modo,
    model: row.modelo,
    status: row.estado,
    previewUrl: row.preview_url,
    previewPath: row.preview_path,
    referenceType: row.referencia_tipo,
    referencePictogramId: row.referencia_pictograma_id,
    referenceUrl: row.referencia_url,
    referencePath: row.referencia_path,
    referenceHadPeople: row.referencia_contiene_personas,
    error: row.error,
    providerRequestId: row.proveedor_request_id,
    seed: row.seed,
    createdAt: row.fecha_creacion,
    updatedAt: row.fecha_actualizacion,
  };
}

export default class AiPictogramRepository {
  ensureSchemaAsync = async () => {
    await BD.execute(`
      CREATE TABLE IF NOT EXISTS generaciones_pictogramas_ia (
        id UUID PRIMARY KEY,
        id_usuario_creador INTEGER NOT NULL REFERENCES usuarios(id),
        id_perteneciente_destino INTEGER NOT NULL REFERENCES pertenecientes(id),
        nombre VARCHAR(160) NOT NULL,
        descripcion TEXT NOT NULL,
        categoria VARCHAR(100) NOT NULL DEFAULT 'otros',
        modo VARCHAR(20) NOT NULL,
        modelo VARCHAR(120) NOT NULL,
        estado VARCHAR(30) NOT NULL DEFAULT 'processing',
        prompt_final TEXT NOT NULL,
        referencia_tipo VARCHAR(30),
        referencia_pictograma_id TEXT,
        referencia_url TEXT,
        referencia_path TEXT,
        referencia_contiene_personas BOOLEAN NOT NULL DEFAULT false,
        preview_url TEXT,
        preview_path TEXT,
        proveedor_request_id TEXT,
        seed BIGINT,
        error TEXT,
        fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        fecha_expiracion TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '24 hours'
      )
    `);
    await BD.execute(`CREATE INDEX IF NOT EXISTS idx_generaciones_pictogramas_creador ON generaciones_pictogramas_ia(id_usuario_creador, fecha_creacion DESC)`);

    await BD.execute(`ALTER TABLE pictogramas ADD COLUMN IF NOT EXISTS id_usuario_creador INTEGER REFERENCES usuarios(id)`);
    await BD.execute(`ALTER TABLE pictogramas ADD COLUMN IF NOT EXISTS id_perteneciente_destino INTEGER REFERENCES pertenecientes(id)`);
    await BD.execute(`ALTER TABLE pictogramas ADD COLUMN IF NOT EXISTS estado_publicacion VARCHAR(30) NOT NULL DEFAULT 'approved'`);
    await BD.execute(`ALTER TABLE pictogramas ADD COLUMN IF NOT EXISTS motivo_revision TEXT`);
    await BD.execute(`ALTER TABLE pictogramas ADD COLUMN IF NOT EXISTS id_administrador_revisor INTEGER REFERENCES usuarios(id)`);
    await BD.execute(`ALTER TABLE pictogramas ADD COLUMN IF NOT EXISTS fecha_revision TIMESTAMPTZ`);
    await BD.execute(`ALTER TABLE pictogramas ADD COLUMN IF NOT EXISTS generacion_ia_id UUID REFERENCES generaciones_pictogramas_ia(id)`);
    await BD.execute(`CREATE INDEX IF NOT EXISTS idx_pictogramas_publicacion ON pictogramas(estado_publicacion, fecha_creacion DESC)`);
  };

  createGenerationAsync = async (data) => {
    const row = await BD.queryOne(`
      INSERT INTO generaciones_pictogramas_ia (
        id, id_usuario_creador, id_perteneciente_destino, nombre, descripcion,
        categoria, modo, modelo, prompt_final, referencia_tipo,
        referencia_pictograma_id, referencia_url, referencia_path, referencia_contiene_personas
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      RETURNING *
    `, [data.id, data.creatorUserId, data.targetPertenecienteId, data.name, data.description,
      data.category, data.mode, data.model, data.prompt, data.referenceType ?? null,
      data.referencePictogramId ?? null, data.referenceUrl ?? null, data.referencePath ?? null,
      Boolean(data.referenceHadPeople)]);
    return mapGeneration(row);
  };

  completeGenerationAsync = async (id, data) => mapGeneration(await BD.queryOne(`
    UPDATE generaciones_pictogramas_ia SET estado='ready', preview_url=$2, preview_path=$3,
      proveedor_request_id=$4, seed=$5, error=NULL, fecha_actualizacion=NOW() WHERE id=$1 RETURNING *
  `, [id, data.previewUrl, data.previewPath, data.providerRequestId ?? null, data.seed ?? null]));

  updateGenerationRevisionAsync = async (id, data) => mapGeneration(await BD.queryOne(`
    UPDATE generaciones_pictogramas_ia
    SET nombre=$2,
        descripcion=$3,
        categoria=$4,
        modo=$5,
        modelo=$6,
        prompt_final=$7,
        estado='ready',
        referencia_tipo=$8,
        referencia_pictograma_id=$9,
        referencia_url=$10,
        referencia_path=$11,
        referencia_contiene_personas=$12,
        preview_url=$13,
        preview_path=$14,
        proveedor_request_id=$15,
        seed=$16,
        error=NULL,
        fecha_actualizacion=NOW()
    WHERE id=$1
    RETURNING *
  `, [
    id,
    data.name,
    data.description,
    data.category,
    data.mode,
    data.model,
    data.prompt,
    data.referenceType ?? null,
    data.referencePictogramId ?? null,
    data.referenceUrl ?? null,
    data.referencePath ?? null,
    Boolean(data.referenceHadPeople),
    data.previewUrl,
    data.previewPath,
    data.providerRequestId ?? null,
    data.seed ?? null,
  ]));

  failGenerationAsync = async (id, error) => mapGeneration(await BD.queryOne(`
    UPDATE generaciones_pictogramas_ia SET estado='failed', error=$2, fecha_actualizacion=NOW() WHERE id=$1 RETURNING *
  `, [id, String(error || 'Error de generacion').slice(0, 1000)]));

  getGenerationAsync = async (id) => mapGeneration(await BD.queryOne('SELECT * FROM generaciones_pictogramas_ia WHERE id=$1', [id]));

  saveGenerationAsync = async (generation, allTargetIds) => {
    const targets = Array.from(new Set(
      (Array.isArray(allTargetIds) && allTargetIds.length > 0 ? allTargetIds : [generation.targetPertenecienteId])
        .map(Number)
        .filter(Boolean),
    ));

    return await BD.transaction(async (client) => {
      await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [generation.id]);

      const existing = await client.query(
        `
          SELECT id, origen_id
          FROM pictogramas
          WHERE origen='TANDEM_AI' AND generacion_ia_id=$1
          ORDER BY fecha_creacion ASC
        `,
        [generation.id],
      );
      if (existing.rows.length > 0) {
        await client.query(`UPDATE generaciones_pictogramas_ia SET estado='saved', fecha_actualizacion=NOW() WHERE id=$1`, [generation.id]);
        return { id: String(existing.rows[0].origen_id), dbId: existing.rows[0].id };
      }

      const results = [];
      for (const targetId of targets) {
        const uniqueOriginId = targets.length > 1 ? `${generation.id}_${targetId}` : generation.id;
        const row = await client.query(
          `
            INSERT INTO pictogramas (
              origen, origen_id, titulo, tipo, url, url_descarga, etiquetas, idioma,
              autor, licencia, texto_busqueda, metadata, id_usuario_creador,
              id_perteneciente_destino, estado_publicacion, generacion_ia_id
            ) VALUES ('TANDEM_AI',$1,$2,$3,$4,$4,'{}','es','TANDEM IA','Uso interno TANDEM',$5,$6::jsonb,$7,$8,'private',$9)
            ON CONFLICT (origen, idioma, origen_id) DO UPDATE SET
              titulo=EXCLUDED.titulo, tipo=EXCLUDED.tipo, url=EXCLUDED.url,
              texto_busqueda=EXCLUDED.texto_busqueda, metadata=EXCLUDED.metadata,
              fecha_actualizacion=NOW()
            RETURNING id, origen_id
          `,
          [
            uniqueOriginId,
            generation.name,
            generation.category,
            generation.previewUrl,
            `${generation.name} ${generation.description} ${generation.category}`.toLowerCase(),
            JSON.stringify({ generated: true, mode: generation.mode, model: generation.model, targetPertenecienteIds: targets }),
            generation.creatorUserId,
            targetId,
            generation.id,
          ],
        );
        results.push({ id: String(row.rows[0].origen_id), dbId: row.rows[0].id });
      }

      await client.query(`UPDATE generaciones_pictogramas_ia SET estado='saved', fecha_actualizacion=NOW() WHERE id=$1`, [generation.id]);
      return results[0] || { id: generation.id, dbId: null };
    });
  };

  listPrivateAsync = async (userId) => BD.query(`
    SELECT p.id, p.origen_id AS id, p.titulo AS name, p.tipo AS category, p.url AS "imageUrl", g.descripcion AS description,
      p.estado_publicacion AS status, p.motivo_revision AS "reviewReason",
      p.id_perteneciente_destino AS "targetPertenecienteId", p.fecha_creacion AS "createdAt"
    FROM pictogramas p LEFT JOIN generaciones_pictogramas_ia g ON g.id=p.generacion_ia_id
    WHERE p.origen='TANDEM_AI' AND p.id_usuario_creador=$1
    ORDER BY p.fecha_creacion DESC
  `, [userId]);

  listForTargetAsync = async (targetId) => BD.query(`
    SELECT p.origen_id AS id, p.titulo AS name, p.tipo AS category, p.url AS "imageUrl",
      '{}'::text[] AS tags, NULL::text AS emoji, p.autor, p.estado_publicacion AS status
    FROM pictogramas p WHERE p.origen='TANDEM_AI' AND p.id_perteneciente_destino=$1
    ORDER BY p.fecha_creacion DESC
  `, [targetId]);

  submitAsync = async (originId, userId) => BD.queryOne(`
    UPDATE pictogramas SET estado_publicacion='pending_review', motivo_revision=NULL, fecha_actualizacion=NOW()
    WHERE origen='TANDEM_AI' AND origen_id=$1 AND id_usuario_creador=$2
      AND estado_publicacion IN ('private','rejected')
    RETURNING origen_id AS id, estado_publicacion AS status
  `, [originId, userId]);

  updateCreationAsync = async (originId, userId, data) => BD.queryOne(`
    UPDATE pictogramas SET titulo=$3, tipo=$4, texto_busqueda=LOWER($3 || ' ' || $4),
      estado_publicacion=CASE WHEN estado_publicacion='rejected' THEN 'private' ELSE estado_publicacion END,
      motivo_revision=NULL, fecha_actualizacion=NOW()
    WHERE origen='TANDEM_AI' AND origen_id=$1 AND id_usuario_creador=$2
      AND estado_publicacion IN ('private','rejected')
    RETURNING origen_id AS id, titulo AS name, tipo AS category, estado_publicacion AS status
  `, [originId, userId, data.name, data.category]);

  updateGenerationDescriptionAsync = async (originId, userId, description) => BD.execute(`
    UPDATE generaciones_pictogramas_ia g SET descripcion=$3, fecha_actualizacion=NOW()
    FROM pictogramas p WHERE p.generacion_ia_id=g.id AND p.origen_id=$1 AND p.id_usuario_creador=$2
      AND p.estado_publicacion IN ('private','rejected')
  `, [originId, userId, description]);

  listModerationAsync = async () => BD.query(`
    SELECT p.origen_id AS id, p.titulo AS name, p.tipo AS category, p.url AS "imageUrl",
      p.metadata, p.id_usuario_creador AS "creatorUserId", p.id_perteneciente_destino AS "targetPertenecienteId",
      p.fecha_creacion AS "createdAt", g.descripcion AS description,
      g.referencia_contiene_personas AS "referenceHadPeople"
    FROM pictogramas p
    LEFT JOIN generaciones_pictogramas_ia g ON g.id=p.generacion_ia_id
    WHERE p.origen='TANDEM_AI' AND p.estado_publicacion='pending_review'
    ORDER BY p.fecha_actualizacion ASC
  `);

  reviewAsync = async (originId, adminUserId, approved, reason) => BD.queryOne(`
    UPDATE pictogramas SET estado_publicacion=$2, motivo_revision=$3,
      id_administrador_revisor=$4, fecha_revision=NOW(), fecha_actualizacion=NOW()
    WHERE origen='TANDEM_AI' AND origen_id=$1 AND estado_publicacion='pending_review'
    RETURNING origen_id AS id, estado_publicacion AS status, motivo_revision AS reason
  `, [originId, approved ? 'approved' : 'rejected', approved ? null : reason, adminUserId]);
}
