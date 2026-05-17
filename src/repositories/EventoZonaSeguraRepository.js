import BD from '../db/BD.js';

export default class EventoZonaSeguraRepository {
  constructor() {
    console.log('Estoy en: EventoZonaSeguraRepository.constructor()');
  }

  getAllAsync = async () => {
    console.log('EventoZonaSeguraRepository.getAllAsync()');
    const sql = `SELECT id, id_zona_segura, id_dispositivo, id_tipo_evento_zona_segura, fecha_evento FROM eventos_zonas_seguras ORDER BY id DESC`;
    return await BD.query(sql);
  };

  getByIdAsync = async (id) => {
    console.log(`EventoZonaSeguraRepository.getByIdAsync(${id})`);
    const sql = `SELECT id, id_zona_segura, id_dispositivo, id_tipo_evento_zona_segura, fecha_evento FROM eventos_zonas_seguras WHERE id = $1`;
    return await BD.queryOne(sql, [id]);
  };

  getByZonaSeguraIdAsync = async (idZonaSegura) => {
    console.log(`EventoZonaSeguraRepository.getByZonaSeguraIdAsync(${idZonaSegura})`);
    const sql = `SELECT id, id_zona_segura, id_dispositivo, id_tipo_evento_zona_segura, fecha_evento FROM eventos_zonas_seguras WHERE id_zona_segura = $1 ORDER BY id DESC`;
    return await BD.query(sql, [idZonaSegura]);
  };

  createAsync = async (entity) => {
    console.log(`EventoZonaSeguraRepository.createAsync(${JSON.stringify(entity)})`);
    const sql = `
      INSERT INTO eventos_zonas_seguras (id_zona_segura, id_dispositivo, id_tipo_evento_zona_segura, fecha_evento)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `;
    const values = [
      entity?.id_zona_segura,
      entity?.id_dispositivo,
      entity?.id_tipo_evento_zona_segura,
      entity?.fecha_evento,
    ];
    const result = await BD.queryOne(sql, values);
    return result?.id ?? 0;
  };

  updateAsync = async (entity) => {
    console.log(`EventoZonaSeguraRepository.updateAsync(${JSON.stringify(entity)})`);
    const id = entity.id;
    const previousEntity = await this.getByIdAsync(id);
    if (previousEntity == null) return 0;
    const sql = `
      UPDATE eventos_zonas_seguras
      SET id_zona_segura = $2, id_dispositivo = $3, id_tipo_evento_zona_segura = $4, fecha_evento = $5
      WHERE id = $1
    `;
    const values = [
      id,
      entity?.id_zona_segura ?? previousEntity.id_zona_segura,
      entity?.id_dispositivo ?? previousEntity.id_dispositivo,
      entity?.id_tipo_evento_zona_segura ?? previousEntity.id_tipo_evento_zona_segura,
      entity?.fecha_evento ?? previousEntity.fecha_evento,
    ];
    return await BD.execute(sql, values);
  };

  deleteByIdAsync = async (id) => {
    console.log(`EventoZonaSeguraRepository.deleteByIdAsync(${id})`);
    const sql = `DELETE FROM eventos_zonas_seguras WHERE id = $1`;
    return await BD.execute(sql, [id]);
  };
}
