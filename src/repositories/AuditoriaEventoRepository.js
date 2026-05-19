import BD from '../db/BD.js';

export default class AuditoriaEventoRepository {
  constructor() {
    console.log('Estoy en: AuditoriaEventoRepository.constructor()');
  }

  getAllAsync = async () => {
    console.log('AuditoriaEventoRepository.getAllAsync()');
    const sql = `SELECT id, id_usuario_actor, id_tipo_evento_auditoria, id_entidad_afectada_auditoria, id_entidad_afectada, descripcion, fecha_evento FROM auditorias_eventos ORDER BY id DESC`;
    return await BD.query(sql);
  };

  getByIdAsync = async (id) => {
    console.log(`AuditoriaEventoRepository.getByIdAsync(${id})`);
    const sql = `SELECT id, id_usuario_actor, id_tipo_evento_auditoria, id_entidad_afectada_auditoria, id_entidad_afectada, descripcion, fecha_evento FROM auditorias_eventos WHERE id = $1`;
    return await BD.queryOne(sql, [id]);
  };

  createAsync = async (entity) => {
    console.log(`AuditoriaEventoRepository.createAsync(${JSON.stringify(entity)})`);
    const sql = `INSERT INTO auditorias_eventos (id_usuario_actor, id_tipo_evento_auditoria, id_entidad_afectada_auditoria, id_entidad_afectada, descripcion, fecha_evento) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`;
    const values = [entity?.id_usuario_actor ?? null, entity?.id_tipo_evento_auditoria ?? null, entity?.id_entidad_afectada_auditoria ?? null, entity?.id_entidad_afectada ?? null, entity?.descripcion ?? null, entity?.fecha_evento ?? null];
    const result = await BD.queryOne(sql, values);
    return result?.id ?? 0;
  };

  updateAsync = async (entity) => {
    console.log(`AuditoriaEventoRepository.updateAsync(${JSON.stringify(entity)})`);
    const id = entity.id;
    const previousEntity = await this.getByIdAsync(id);
    if (previousEntity == null) return 0;
    const sql = `UPDATE auditorias_eventos SET id_usuario_actor = $2, id_tipo_evento_auditoria = $3, id_entidad_afectada_auditoria = $4, id_entidad_afectada = $5, descripcion = $6, fecha_evento = $7 WHERE id = $1`;
    const values = [id, entity?.id_usuario_actor ?? previousEntity.id_usuario_actor, entity?.id_tipo_evento_auditoria ?? previousEntity.id_tipo_evento_auditoria, entity?.id_entidad_afectada_auditoria ?? previousEntity.id_entidad_afectada_auditoria, entity?.id_entidad_afectada ?? previousEntity.id_entidad_afectada, entity?.descripcion ?? previousEntity.descripcion, entity?.fecha_evento ?? previousEntity.fecha_evento];
    return await BD.execute(sql, values);
  };

  deleteByIdAsync = async (id) => {
    console.log(`AuditoriaEventoRepository.deleteByIdAsync(${id})`);
    const sql = `DELETE FROM auditorias_eventos WHERE id = $1`;
    return await BD.execute(sql, [id]);
  };
}
