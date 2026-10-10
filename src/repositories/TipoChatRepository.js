import BD from '../db/BD.js';
import CatalogRepository from './base/CatalogRepository.js';

export default class TipoChatRepository extends CatalogRepository {
  constructor() {
    super({ table: 'tipos_chats' });
  }

  getByNombreAsync = async (nombre) => {
    const sql = `SELECT id, nombre, orden FROM tipos_chats WHERE LOWER(nombre) = LOWER($1)`;
    return await BD.queryOne(sql, [nombre]);
  };
}
