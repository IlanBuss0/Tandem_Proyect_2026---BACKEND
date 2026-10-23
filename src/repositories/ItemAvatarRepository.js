import BD from '../db/BD.js';

export default class ItemAvatarRepository {
  ensureStudioCatalogAsync = async (catalog) => BD.transaction(async client => {
    // Serialize additive catalog initialization without relying on a new unique index.
    await client.query("SELECT pg_advisory_xact_lock(hashtext('tandem-avatar-studio-catalog'))");
    const { rows: types } = await client.query('SELECT id, nombre FROM tipos_items_avatares ORDER BY id');
    if (catalog.some(item => item.category === 'hairstyle') && !types.some(type => /^peinados?$/i.test(type.nombre))) {
      const { rows: [type] } = await client.query(`INSERT INTO tipos_items_avatares (nombre,orden)
        SELECT 'Peinados',COALESCE(MAX(orden),0)+1 FROM tipos_items_avatares RETURNING id,nombre`);
      types.push(type);
    }
    for (const item of catalog) {
      const type = types.find(type => /^peinados?$/i.test(type.nombre) && item.category === 'hairstyle')
        || types.find(type => /accesorio/i.test(type.nombre) && item.category === 'accessory')
        || types.find(type => /ropa/i.test(type.nombre)) || types[0];
      if (!type) throw new Error('Falta el catalogo de tipos de articulos de avatar.');
      await client.query(`INSERT INTO items_avatares (id_tipo_item_avatar,nombre,codigo_item_externo,precio_punto,activo)
        SELECT $1,$2,$3,$4,true WHERE NOT EXISTS (SELECT 1 FROM items_avatares WHERE codigo_item_externo=$5)`,
      // INSERT infers varchar for $3; the equality operator infers text for $5.
      [type.id, item.name, item.id, item.price, item.id]);
    }
  });

  constructor() {
    console.log('Estoy en: ItemAvatarRepository.constructor()');
  }

  getAllAsync = async () => {
    console.log('ItemAvatarRepository.getAllAsync()');
    const sql = `SELECT id, id_tipo_item_avatar, nombre, codigo_item_externo, precio_punto, requiere_cantidad_actividad, requiere_id_dificultad_actividad, activo FROM items_avatares ORDER BY id DESC`;
    return await BD.query(sql);
  };

  getByIdAsync = async (id) => {
    console.log(`ItemAvatarRepository.getByIdAsync(${id})`);
    const sql = `SELECT id, id_tipo_item_avatar, nombre, codigo_item_externo, precio_punto, requiere_cantidad_actividad, requiere_id_dificultad_actividad, activo FROM items_avatares WHERE id = $1`;
    return await BD.queryOne(sql, [id]);
  };

  createAsync = async (entity) => {
    console.log(`ItemAvatarRepository.createAsync(${JSON.stringify(entity)})`);
    const sql = `
      INSERT INTO items_avatares (id_tipo_item_avatar, nombre, codigo_item_externo, precio_punto, requiere_cantidad_actividad, requiere_id_dificultad_actividad, activo)
      VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, true))
      RETURNING id
    `;
    const values = [
      entity?.id_tipo_item_avatar,
      entity?.nombre,
      entity?.codigo_item_externo ?? null,
      entity?.precio_punto,
      entity?.requiere_cantidad_actividad ?? null,
      entity?.requiere_id_dificultad_actividad ?? null,
      entity?.activo ?? true,
    ];
    const result = await BD.queryOne(sql, values);
    return result?.id ?? 0;
  };

  updateAsync = async (entity) => {
    console.log(`ItemAvatarRepository.updateAsync(${JSON.stringify(entity)})`);
    const id = entity.id;
    const previousEntity = await this.getByIdAsync(id);
    if (previousEntity == null) return 0;
    const sql = `
      UPDATE items_avatares
      SET id_tipo_item_avatar = $2, nombre = $3, codigo_item_externo = $4, precio_punto = $5, requiere_cantidad_actividad = $6, requiere_id_dificultad_actividad = $7, activo = $8
      WHERE id = $1
    `;
    const values = [
      id,
      entity?.id_tipo_item_avatar ?? previousEntity.id_tipo_item_avatar,
      entity?.nombre ?? previousEntity.nombre,
      entity?.codigo_item_externo ?? previousEntity.codigo_item_externo,
      entity?.precio_punto ?? previousEntity.precio_punto,
      entity?.requiere_cantidad_actividad ?? previousEntity.requiere_cantidad_actividad,
      entity?.requiere_id_dificultad_actividad ?? previousEntity.requiere_id_dificultad_actividad,
      entity?.activo ?? previousEntity.activo,
    ];
    return await BD.execute(sql, values);
  };

  deleteByIdAsync = async (id) => {
    console.log(`ItemAvatarRepository.deleteByIdAsync(${id})`);
    const sql = `UPDATE items_avatares SET activo = false WHERE id = $1`;
    return await BD.execute(sql, [id]);
  };
}
