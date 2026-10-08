import BD from '../../db/BD.js';
import BaseCrudRepository from './BaseCrudRepository.js';

export default class ConfigurationRepository extends BaseCrudRepository {
  constructor({ table }) {
    super({
      table,
      selectColumns: ['id', 'id_usuario', 'clave', 'valor', 'fecha_modificacion'],
      insertColumns: ['id_usuario', 'clave', 'valor', 'fecha_modificacion'],
      updateColumns: ['id_usuario', 'clave', 'valor', 'fecha_modificacion'],
      orderBy: 'id DESC',
    });
  }

  getByUsuarioIdAsync = async (idUsuario) => BD.query(
    `SELECT ${this.selection} FROM ${this.table} WHERE id_usuario = $1 ORDER BY clave ASC`,
    [idUsuario],
  );

  getByUsuarioAndClaveAsync = async (idUsuario, clave) => BD.queryOne(
    `SELECT ${this.selection} FROM ${this.table} WHERE id_usuario = $1 AND clave = $2`,
    [idUsuario, clave],
  );
}
