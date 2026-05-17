import BD from '../db/BD.js';

export default class ContactoRepository {
  constructor() {
    console.log('Estoy en: ContactoRepository.constructor()');
  }

  getAllAsync = async () => {
    console.log('ContactoRepository.getAllAsync()');
    const sql = `SELECT id, id_usuario_menor, id_usuario_mayor, id_usuario_solicitante, id_estado_contacto, fecha_solicitud, fecha_resolucion FROM contactos ORDER BY id DESC`;
    return await BD.query(sql);
  };

  getByIdAsync = async (id) => {
    console.log(`ContactoRepository.getByIdAsync(${id})`);
    const sql = `SELECT id, id_usuario_menor, id_usuario_mayor, id_usuario_solicitante, id_estado_contacto, fecha_solicitud, fecha_resolucion FROM contactos WHERE id = $1`;
    return await BD.queryOne(sql, [id]);
  };

  getByParejaNormalizadaAsync = async (idUsuarioMenor, idUsuarioMayor) => {
    console.log(`ContactoRepository.getByParejaNormalizadaAsync(${idUsuarioMenor}, ${idUsuarioMayor})`);
    const sql = `SELECT id, id_usuario_menor, id_usuario_mayor, id_usuario_solicitante, id_estado_contacto, fecha_solicitud, fecha_resolucion FROM contactos WHERE id_usuario_menor = $1 AND id_usuario_mayor = $2`;
    return await BD.queryOne(sql, [idUsuarioMenor, idUsuarioMayor]);
  };

  createAsync = async (entity) => {
    console.log(`ContactoRepository.createAsync(${JSON.stringify(entity)})`);
    const sql = `INSERT INTO contactos (id_usuario_menor, id_usuario_mayor, id_usuario_solicitante, id_estado_contacto, fecha_solicitud, fecha_resolucion) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`;
    const values = [entity?.id_usuario_menor, entity?.id_usuario_mayor, entity?.id_usuario_solicitante, entity?.id_estado_contacto, entity?.fecha_solicitud, entity?.fecha_resolucion ?? null];
    const result = await BD.queryOne(sql, values);
    return result?.id ?? 0;
  };

  updateAsync = async (entity) => {
    console.log(`ContactoRepository.updateAsync(${JSON.stringify(entity)})`);
    const id = entity.id;
    const previousEntity = await this.getByIdAsync(id);
    if (previousEntity == null) return 0;
    const sql = `UPDATE contactos SET id_usuario_menor = $2, id_usuario_mayor = $3, id_usuario_solicitante = $4, id_estado_contacto = $5, fecha_solicitud = $6, fecha_resolucion = $7 WHERE id = $1`;
    const values = [id, entity?.id_usuario_menor ?? previousEntity.id_usuario_menor, entity?.id_usuario_mayor ?? previousEntity.id_usuario_mayor, entity?.id_usuario_solicitante ?? previousEntity.id_usuario_solicitante, entity?.id_estado_contacto ?? previousEntity.id_estado_contacto, entity?.fecha_solicitud ?? previousEntity.fecha_solicitud, entity?.fecha_resolucion ?? previousEntity.fecha_resolucion];
    return await BD.execute(sql, values);
  };

  deleteByIdAsync = async (id) => {
    console.log(`ContactoRepository.deleteByIdAsync(${id})`);
    const sql = `DELETE FROM contactos WHERE id = $1`;
    return await BD.execute(sql, [id]);
  };
}
