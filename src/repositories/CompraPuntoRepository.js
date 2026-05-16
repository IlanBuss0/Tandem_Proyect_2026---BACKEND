import BD from '../db/BD.js';

export default class CompraPuntoRepository {
  constructor() {
    console.log('Estoy en: CompraPuntoRepository.constructor()');
  }

  getAllAsync = async () => {
    console.log('CompraPuntoRepository.getAllAsync()');
    const sql = `SELECT id, id_usuario, id_perteneciente, id_paquete_punto, id_estado_pago, comprobante_url, pagado, fecha_compra FROM "ComprasPuntos" ORDER BY id DESC`;
    return await BD.query(sql);
  };

  getByIdAsync = async (id) => {
    console.log(`CompraPuntoRepository.getByIdAsync(${id})`);
    const sql = `SELECT id, id_usuario, id_perteneciente, id_paquete_punto, id_estado_pago, comprobante_url, pagado, fecha_compra FROM "ComprasPuntos" WHERE id = $1`;
    return await BD.queryOne(sql, [id]);
  };

  getByPertenecienteIdAsync = async (idPerteneciente) => {
    console.log(`CompraPuntoRepository.getByPertenecienteIdAsync(${idPerteneciente})`);
    const sql = `SELECT id, id_usuario, id_perteneciente, id_paquete_punto, id_estado_pago, comprobante_url, pagado, fecha_compra FROM "ComprasPuntos" WHERE id_perteneciente = $1 ORDER BY id DESC`;
    return await BD.query(sql, [idPerteneciente]);
  };

  createAsync = async (entity) => {
    console.log(`CompraPuntoRepository.createAsync(${JSON.stringify(entity)})`);
    const sql = `
      INSERT INTO "ComprasPuntos" (id_usuario, id_perteneciente, id_paquete_punto, id_estado_pago, comprobante_url, pagado, fecha_compra)
      VALUES ($1, $2, $3, $4, $5, COALESCE($6, false), $7)
      RETURNING id
    `;
    const values = [
      entity?.id_usuario,
      entity?.id_perteneciente,
      entity?.id_paquete_punto,
      entity?.id_estado_pago,
      entity?.comprobante_url ?? null,
      entity?.pagado ?? false,
      entity?.fecha_compra,
    ];
    const result = await BD.queryOne(sql, values);
    return result?.id ?? 0;
  };

  updateAsync = async (entity) => {
    console.log(`CompraPuntoRepository.updateAsync(${JSON.stringify(entity)})`);
    const id = entity.id;
    const previousEntity = await this.getByIdAsync(id);
    if (previousEntity == null) return 0;
    const sql = `
      UPDATE "ComprasPuntos"
      SET id_usuario = $2, id_perteneciente = $3, id_paquete_punto = $4, id_estado_pago = $5, comprobante_url = $6, pagado = $7, fecha_compra = $8
      WHERE id = $1
    `;
    const values = [
      id,
      entity?.id_usuario ?? previousEntity.id_usuario,
      entity?.id_perteneciente ?? previousEntity.id_perteneciente,
      entity?.id_paquete_punto ?? previousEntity.id_paquete_punto,
      entity?.id_estado_pago ?? previousEntity.id_estado_pago,
      entity?.comprobante_url ?? previousEntity.comprobante_url,
      entity?.pagado ?? previousEntity.pagado,
      entity?.fecha_compra ?? previousEntity.fecha_compra,
    ];
    return await BD.execute(sql, values);
  };

  deleteByIdAsync = async (id) => {
    console.log(`CompraPuntoRepository.deleteByIdAsync(${id})`);
    const sql = `DELETE FROM "ComprasPuntos" WHERE id = $1`;
    return await BD.execute(sql, [id]);
  };
}
