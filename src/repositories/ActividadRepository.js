import BD from '../db/BD.js';

export default class ActividadRepository {
  constructor() {
    console.log('Estoy en: ActividadRepository.constructor()');
  }

  getAllAsync = async () => {
    console.log('ActividadRepository.getAllAsync()');

    const sql = `
      SELECT
        id,
        id_tipo_actividad,
        id_punto_otorgado,
        titulo,
        descripcion,
        es_integrada,
        activa
      FROM actividades
      ORDER BY id DESC
    `;

    return await BD.query(sql);
  };

  getByIdAsync = async (id) => {
    console.log(`ActividadRepository.getByIdAsync(${id})`);

    const sql = `
      SELECT
        id,
        id_tipo_actividad,
        id_punto_otorgado,
        titulo,
        descripcion,
        es_integrada,
        activa
      FROM actividades
      WHERE id = $1
    `;

    return await BD.queryOne(sql, [id]);
  };

  createAsync = async (entity) => {
    console.log(`ActividadRepository.createAsync(${JSON.stringify(entity)})`);

    const sql = `
      INSERT INTO actividades (
        id_tipo_actividad,
        id_punto_otorgado,
        titulo,
        descripcion,
        es_integrada,
        activa
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        COALESCE($5, false),
        COALESCE($6, true)
      )
      RETURNING id
    `;

    const values = [
      entity?.id_tipo_actividad,
      entity?.id_punto_otorgado,
      entity?.titulo,
      entity?.descripcion ?? null,
      entity?.es_integrada ?? false,
      entity?.activa ?? true,
    ];

    const result = await BD.queryOne(sql, values);

    return result?.id ?? 0;
  };

  updateAsync = async (entity) => {
    console.log(`ActividadRepository.updateAsync(${JSON.stringify(entity)})`);

    const id = entity.id;

    const previousEntity = await this.getByIdAsync(id);

    if (previousEntity == null) return 0;

    const sql = `
      UPDATE actividades
      SET
        id_tipo_actividad = $2,
        id_punto_otorgado = $3,
        titulo = $4,
        descripcion = $5,
        es_integrada = $6,
        activa = $7
      WHERE id = $1
    `;

    const values = [
      id,
      entity?.id_tipo_actividad ?? previousEntity.id_tipo_actividad,
      entity?.id_punto_otorgado ?? previousEntity.id_punto_otorgado,
      entity?.titulo ?? previousEntity.titulo,
      entity?.descripcion ?? previousEntity.descripcion,
      entity?.es_integrada ?? previousEntity.es_integrada,
      entity?.activa ?? previousEntity.activa,
    ];

    return await BD.execute(sql, values);
  };

  deleteByIdAsync = async (id) => {
    console.log(`ActividadRepository.deleteByIdAsync(${id})`);

    const sql = `
      UPDATE actividades
      SET activa = false
      WHERE id = $1
    `;

    return await BD.execute(sql, [id]);
  };
}
