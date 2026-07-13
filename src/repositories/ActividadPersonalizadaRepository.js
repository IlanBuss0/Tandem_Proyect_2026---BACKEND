import BD from '../db/BD.js';

export default class ActividadPersonalizadaRepository {
  constructor() {
    console.log('Estoy en: ActividadPersonalizadaRepository.constructor()');
  }

  getAllAsync = async () => {
    console.log('ActividadPersonalizadaRepository.getAllAsync()');

    const sql = `
      SELECT
        id,
        id_actividad_base,
        id_tipo_actividad,
        id_punto_otorgado,
        id_usuario_creador,
        titulo,
        descripcion,
        fecha_creacion,
        activa
      FROM actividades_personalizadas
      ORDER BY id DESC
    `;

    return await BD.query(sql);
  };

  getByIdAsync = async (id) => {
    console.log(`ActividadPersonalizadaRepository.getByIdAsync(${id})`);

    const sql = `
      SELECT
        id,
        id_actividad_base,
        id_tipo_actividad,
        id_punto_otorgado,
        id_usuario_creador,
        titulo,
        descripcion,
        fecha_creacion,
        activa
      FROM actividades_personalizadas
      WHERE id = $1
    `;

    return await BD.queryOne(sql, [id]);
  };

  getByUsuarioCreadorAsync = async (idUsuarioCreador) => {
    console.log(`ActividadPersonalizadaRepository.getByUsuarioCreadorAsync(${idUsuarioCreador})`);

    const sql = `
      SELECT
        id,
        id_actividad_base,
        id_tipo_actividad,
        id_punto_otorgado,
        id_usuario_creador,
        titulo,
        descripcion,
        fecha_creacion,
        activa
      FROM actividades_personalizadas
      WHERE id_usuario_creador = $1
      ORDER BY id DESC
    `;

    return await BD.query(sql, [idUsuarioCreador]);
  };

  getByPertenecienteIdAsync = async (idPerteneciente) => {
    console.log(`ActividadPersonalizadaRepository.getByPertenecienteIdAsync(${idPerteneciente})`);

    const sql = `
      SELECT DISTINCT
        ap.id,
        ap.id_actividad_base,
        ap.id_tipo_actividad,
        ap.id_punto_otorgado,
        ap.id_usuario_creador,
        ap.titulo,
        ap.descripcion,
        ap.fecha_creacion,
        ap.activa
      FROM actividades_personalizadas ap
      INNER JOIN actividades_asignadas aa
        ON aa.id_actividad_personalizada = ap.id
      WHERE aa.id_perteneciente = $1
        AND ap.activa = true
      ORDER BY ap.id DESC
    `;

    return await BD.query(sql, [idPerteneciente]);
  };

  createAsync = async (entity) => {
    console.log(`ActividadPersonalizadaRepository.createAsync(${JSON.stringify(entity)})`);

    const sql = `
      INSERT INTO actividades_personalizadas (
        id_actividad_base,
        id_tipo_actividad,
        id_punto_otorgado,
        id_usuario_creador,
        titulo,
        descripcion,
        fecha_creacion,
        activa
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        COALESCE($8, true)
      )
      RETURNING id
    `;

    const values = [
      entity?.id_actividad_base ?? null,
      entity?.id_tipo_actividad,
      entity?.id_punto_otorgado,
      entity?.id_usuario_creador,
      entity?.titulo,
      entity?.descripcion ?? null,
      entity?.fecha_creacion,
      entity?.activa ?? true,
    ];

    const result = await BD.queryOne(sql, values);

    return result?.id ?? 0;
  };

  updateAsync = async (entity) => {
    console.log(`ActividadPersonalizadaRepository.updateAsync(${JSON.stringify(entity)})`);

    const id = entity.id;

    const previousEntity = await this.getByIdAsync(id);

    if (previousEntity == null) return 0;

    const sql = `
      UPDATE actividades_personalizadas
      SET
        id_actividad_base = $2,
        id_tipo_actividad = $3,
        id_punto_otorgado = $4,
        id_usuario_creador = $5,
        titulo = $6,
        descripcion = $7,
        fecha_creacion = $8,
        activa = $9
      WHERE id = $1
    `;

    const values = [
      id,
      entity?.id_actividad_base ?? previousEntity.id_actividad_base,
      entity?.id_tipo_actividad ?? previousEntity.id_tipo_actividad,
      entity?.id_punto_otorgado ?? previousEntity.id_punto_otorgado,
      entity?.id_usuario_creador ?? previousEntity.id_usuario_creador,
      entity?.titulo ?? previousEntity.titulo,
      entity?.descripcion ?? previousEntity.descripcion,
      entity?.fecha_creacion ?? previousEntity.fecha_creacion,
      entity?.activa ?? previousEntity.activa,
    ];

    return await BD.execute(sql, values);
  };

  deleteByIdAsync = async (id) => {
    console.log(`ActividadPersonalizadaRepository.deleteByIdAsync(${id})`);

    const sql = `
      UPDATE actividades_personalizadas
      SET activa = false
      WHERE id = $1
    `;

    return await BD.execute(sql, [id]);
  };
}
