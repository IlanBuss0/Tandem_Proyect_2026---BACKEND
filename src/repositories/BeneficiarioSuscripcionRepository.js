import BD from '../db/BD.js';

export default class BeneficiarioSuscripcionRepository {
  constructor() {
    console.log('Estoy en: BeneficiarioSuscripcionRepository.constructor()');
  }

  getAllAsync = async () => {
    console.log('BeneficiarioSuscripcionRepository.getAllAsync()');
    const sql = `SELECT id, id_suscripcion, id_usuario_beneficiario FROM beneficiarios_suscripciones ORDER BY id DESC`;
    return await BD.query(sql);
  };

  getByIdAsync = async (id) => {
    console.log(`BeneficiarioSuscripcionRepository.getByIdAsync(${id})`);
    const sql = `SELECT id, id_suscripcion, id_usuario_beneficiario FROM beneficiarios_suscripciones WHERE id = $1`;
    return await BD.queryOne(sql, [id]);
  };

  createAsync = async (entity) => {
    console.log(`BeneficiarioSuscripcionRepository.createAsync(${JSON.stringify(entity)})`);
    const sql = `INSERT INTO beneficiarios_suscripciones (id_suscripcion, id_usuario_beneficiario) VALUES ($1, $2) RETURNING id`;
    const values = [entity?.id_suscripcion ?? null, entity?.id_usuario_beneficiario ?? null];
    const result = await BD.queryOne(sql, values);
    return result?.id ?? 0;
  };

  updateAsync = async (entity) => {
    console.log(`BeneficiarioSuscripcionRepository.updateAsync(${JSON.stringify(entity)})`);
    const id = entity.id;
    const previousEntity = await this.getByIdAsync(id);
    if (previousEntity == null) return 0;
    const sql = `UPDATE beneficiarios_suscripciones SET id_suscripcion = $2, id_usuario_beneficiario = $3 WHERE id = $1`;
    const values = [id, entity?.id_suscripcion ?? previousEntity.id_suscripcion, entity?.id_usuario_beneficiario ?? previousEntity.id_usuario_beneficiario];
    return await BD.execute(sql, values);
  };

  deleteByIdAsync = async (id) => {
    console.log(`BeneficiarioSuscripcionRepository.deleteByIdAsync(${id})`);
    const sql = `DELETE FROM beneficiarios_suscripciones WHERE id = $1`;
    return await BD.execute(sql, [id]);
  };
}
