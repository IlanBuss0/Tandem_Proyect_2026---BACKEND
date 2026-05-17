import BD from '../db/BD.js';

export default class FavoritoActividadRepository {
  constructor() {
    console.log('Estoy en: FavoritoActividadRepository.constructor()');
  }

  getAllAsync = async () => {
    console.log('FavoritoActividadRepository.getAllAsync()');

    const sql = `
      SELECT
        id,
        id_perteneciente,
        id_actividad,
        id_actividad_personalizada,
        fecha_marcado
      FROM favoritos_actividades
      ORDER BY id DESC
    `;

    return await BD.query(sql);
  };

  getByIdAsync = async (id) => {
    console.log(`FavoritoActividadRepository.getByIdAsync(${id})`);

    const sql = `
      SELECT
        id,
        id_perteneciente,
        id_actividad,
        id_actividad_personalizada,
        fecha_marcado
      FROM favoritos_actividades
      WHERE id = $1
    `;

    return await BD.queryOne(sql, [id]);
  };

  getByPertenecienteIdAsync = async (idPerteneciente) => {
    console.log(`FavoritoActividadRepository.getByPertenecienteIdAsync(${idPerteneciente})`);

    const sql = `
      SELECT
        id,
        id_perteneciente,
        id_actividad,
        id_actividad_personalizada,
        fecha_marcado
      FROM favoritos_actividades
      WHERE id_perteneciente = $1
      ORDER BY id DESC
    `;

    return await BD.query(sql, [idPerteneciente]);
  };

  createAsync = async (entity) => {
    console.log(`FavoritoActividadRepository.createAsync(${JSON.stringify(entity)})`);

    const sql = `
      INSERT INTO favoritos_actividades (
        id_perteneciente,
        id_actividad,
        id_actividad_personalizada,
        fecha_marcado
      )
      VALUES (
        $1,
        $2,
        $3,
        $4
      )
      RETURNING id
    `;

    const values = [
      entity?.id_perteneciente,
      entity?.id_actividad ?? null,
      entity?.id_actividad_personalizada ?? null,
      entity?.fecha_marcado,
    ];

    const result = await BD.queryOne(sql, values);

    return result?.id ?? 0;
  };

  updateAsync = async (entity) => {
    console.log(`FavoritoActividadRepository.updateAsync(${JSON.stringify(entity)})`);

    const id = entity.id;

    const previousEntity = await this.getByIdAsync(id);

    if (previousEntity == null) return 0;

    const sql = `
      UPDATE favoritos_actividades
      SET
        id_perteneciente = $2,
        id_actividad = $3,
        id_actividad_personalizada = $4,
        fecha_marcado = $5
      WHERE id = $1
    `;

    const values = [
      id,
      entity?.id_perteneciente ?? previousEntity.id_perteneciente,
      entity?.id_actividad ?? previousEntity.id_actividad,
      entity?.id_actividad_personalizada ?? previousEntity.id_actividad_personalizada,
      entity?.fecha_marcado ?? previousEntity.fecha_marcado,
    ];

    return await BD.execute(sql, values);
  };

  deleteByIdAsync = async (id) => {
    console.log(`FavoritoActividadRepository.deleteByIdAsync(${id})`);

    const sql = `
      DELETE FROM favoritos_actividades
      WHERE id = $1
    `;

    return await BD.execute(sql, [id]);
  };
}
