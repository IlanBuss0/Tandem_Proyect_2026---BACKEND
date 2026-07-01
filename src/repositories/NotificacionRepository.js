import BD from '../db/BD.js';

export default class NotificacionRepository {
  constructor() {
    console.log('Estoy en: NotificacionRepository.constructor()');
  }

  getAllAsync = async () => {
    console.log('NotificacionRepository.getAllAsync()');
    const sql = `SELECT id, id_usuario_destino, id_usuario_actor, id_tipo_notificacion, titulo, cuerpo, leida, fecha_creacion, fecha_lectura, reference_type, reference_id FROM notificaciones ORDER BY id DESC`;
    return await BD.query(sql);
  };

  getByIdAsync = async (id) => {
    console.log(`NotificacionRepository.getByIdAsync(${id})`);
    const sql = `SELECT id, id_usuario_destino, id_usuario_actor, id_tipo_notificacion, titulo, cuerpo, leida, fecha_creacion, fecha_lectura, reference_type, reference_id FROM notificaciones WHERE id = $1`;
    return await BD.queryOne(sql, [id]);
  };

  getByUsuarioDestinoIdAsync = async (idUsuarioDestino) => {
    console.log(`NotificacionRepository.getByUsuarioDestinoIdAsync(${idUsuarioDestino})`);
    const sql = `SELECT id, id_usuario_destino, id_usuario_actor, id_tipo_notificacion, titulo, cuerpo, leida, fecha_creacion, fecha_lectura, reference_type, reference_id FROM notificaciones WHERE id_usuario_destino = $1 ORDER BY id DESC`;
    return await BD.query(sql, [idUsuarioDestino]);
  };

  createAsync = async (entity) => {
    console.log(`NotificacionRepository.createAsync(${JSON.stringify(entity)})`);
    const sql = `INSERT INTO notificaciones (id_usuario_destino, id_usuario_actor, id_tipo_notificacion, titulo, cuerpo, leida, fecha_creacion, fecha_lectura, reference_type, reference_id) VALUES ($1, $2, $3, $4, $5, COALESCE($6, false), $7, $8, $9, $10) RETURNING id`;
    const values = [entity?.id_usuario_destino, entity?.id_usuario_actor ?? null, entity?.id_tipo_notificacion, entity?.titulo, entity?.cuerpo ?? null, entity?.leida ?? false, entity?.fecha_creacion, entity?.fecha_lectura ?? null, entity?.reference_type ?? null, entity?.reference_id ?? null];
    const result = await BD.queryOne(sql, values);
    return result?.id ?? 0;
  };

  createManyAsync = async (entities) => {
    console.log(`NotificacionRepository.createManyAsync(${entities?.length ?? 0})`);
    if (!Array.isArray(entities) || entities.length === 0) return 0;

    const chunkSize = 1000;
    let totalRows = 0;

    for (let i = 0; i < entities.length; i += chunkSize) {
      totalRows += await this.createManyChunkAsync(entities.slice(i, i + chunkSize));
    }

    return totalRows;
  };

  createManyChunkAsync = async (entities) => {
    const columnsPerRow = 10;
    const values = [];
    const placeholders = entities.map((entity, index) => {
      const base = index * columnsPerRow;
      values.push(
        entity?.id_usuario_destino,
        entity?.id_usuario_actor ?? null,
        entity?.id_tipo_notificacion,
        entity?.titulo,
        entity?.cuerpo ?? null,
        entity?.leida ?? false,
        entity?.fecha_creacion,
        entity?.fecha_lectura ?? null,
        entity?.reference_type ?? null,
        entity?.reference_id ?? null,
      );

      return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, COALESCE($${base + 6}, false), $${base + 7}, $${base + 8}, $${base + 9}, $${base + 10})`;
    });

    const sql = `
      INSERT INTO notificaciones
        (id_usuario_destino, id_usuario_actor, id_tipo_notificacion, titulo, cuerpo, leida, fecha_creacion, fecha_lectura, reference_type, reference_id)
      VALUES ${placeholders.join(', ')}
    `;

    return await BD.execute(sql, values);
  };

  updateAsync = async (entity) => {
    console.log(`NotificacionRepository.updateAsync(${JSON.stringify(entity)})`);
    const id = entity.id;
    const previousEntity = await this.getByIdAsync(id);
    if (previousEntity == null) return 0;
    const sql = `UPDATE notificaciones SET id_usuario_destino = $2, id_usuario_actor = $3, id_tipo_notificacion = $4, titulo = $5, cuerpo = $6, leida = $7, fecha_creacion = $8, fecha_lectura = $9, reference_type = $10, reference_id = $11 WHERE id = $1`;
    const values = [id, entity?.id_usuario_destino ?? previousEntity.id_usuario_destino, entity?.id_usuario_actor ?? previousEntity.id_usuario_actor, entity?.id_tipo_notificacion ?? previousEntity.id_tipo_notificacion, entity?.titulo ?? previousEntity.titulo, entity?.cuerpo ?? previousEntity.cuerpo, entity?.leida ?? previousEntity.leida, entity?.fecha_creacion ?? previousEntity.fecha_creacion, entity?.fecha_lectura ?? previousEntity.fecha_lectura, entity?.reference_type ?? previousEntity.reference_type, entity?.reference_id ?? previousEntity.reference_id];
    return await BD.execute(sql, values);
  };

  deleteByIdAsync = async (id) => {
    console.log(`NotificacionRepository.deleteByIdAsync(${id})`);
    const sql = `DELETE FROM notificaciones WHERE id = $1`;
    return await BD.execute(sql, [id]);
  };
}
