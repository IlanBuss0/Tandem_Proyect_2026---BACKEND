import BD from '../db/BD.js';
import AppError from '../modules/errors/AppError.js';
import InventarioAvatarRepository from '../repositories/InventarioAvatarRepository.js';

export default class InventarioAvatarService {
  constructor() {
    console.log('Estoy en: InventarioAvatarService.constructor()');
    this.InventarioAvatarRepository = new InventarioAvatarRepository();
  }

  getAllAsync = async () => {
    console.log('InventarioAvatarService.getAllAsync()');
    const returnArray = await this.InventarioAvatarRepository.getAllAsync();
    if (returnArray == null) return null;
    return returnArray;
  };

  getByIdAsync = async (id) => {
    console.log(`InventarioAvatarService.getByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id del inventario es invalido.');
    }
    const returnEntity = await this.InventarioAvatarRepository.getByIdAsync(id);
    return returnEntity;
  };

  createAsync = async (entity) => {
    this.validarInventarioParaCrear(entity);
    return BD.transaction(async client => {
      const { rows: [avatar] } = await client.query('SELECT * FROM avatares WHERE id=$1 FOR UPDATE', [entity.id_avatar]);
      const { rows: [item] } = await client.query('SELECT * FROM items_avatares WHERE id=$1 AND activo=true FOR SHARE', [entity.id_item_avatar]);
      if (!avatar || !item) throw new AppError('Avatar o articulo no disponible.', 404);
      const { rows: existing } = await client.query('SELECT id FROM inventarios_avatares WHERE id_avatar=$1 AND id_item_avatar=$2', [avatar.id, item.id]);
      if (existing.length) throw new AppError('El articulo ya pertenece al inventario.', 409);
      if (item.requiere_id_dificultad_actividad) throw new AppError('Este articulo requiere una validacion de dificultad antes de habilitar su compra.', 403);
      const price = Number(item.precio_punto);
      if (!Number.isFinite(price) || price < 0) throw new AppError('Precio no valido.', 409);
      if (item.requiere_cantidad_actividad) {
        const { rows: [completed] } = await client.query('SELECT COUNT(*)::int AS total FROM actividades_asignadas WHERE id_perteneciente=$1 AND fecha_completada IS NOT NULL', [avatar.id_perteneciente]);
        if (completed.total < Number(item.requiere_cantidad_actividad)) throw new AppError('Todavia no cumplis los requisitos del articulo.', 403);
      }
      await client.query('INSERT INTO saldos_puntos (id_perteneciente,saldo) VALUES ($1,0) ON CONFLICT (id_perteneciente) DO NOTHING', [avatar.id_perteneciente]);
      const { rowCount } = await client.query('UPDATE saldos_puntos SET saldo=saldo-$2 WHERE id_perteneciente=$1 AND saldo >= $2', [avatar.id_perteneciente, price]);
      if (!rowCount) throw new AppError('Saldo insuficiente.', 409);
      const { rows: [created] } = await client.query('INSERT INTO inventarios_avatares (id_avatar,id_item_avatar,equipado,fecha_obtencion) VALUES ($1,$2,$3,NOW()) RETURNING id', [avatar.id, item.id, entity.equipado === true]);
      return created.id;
    });
  };

  updateAsync = async (entity) => {
    console.log(`InventarioAvatarService.updateAsync(${JSON.stringify(entity)})`);
    if (!entity?.id || Number.isNaN(entity.id)) {
      throw new Error('El id del inventario es obligatorio para actualizar.');
    }
    const previousEntity = await this.InventarioAvatarRepository.getByIdAsync(entity.id);
    if (previousEntity == null) return 0;
    const rowsAffected = await this.InventarioAvatarRepository.updateAsync(entity);
    return rowsAffected;
  };

  deleteByIdAsync = async (id) => {
    console.log(`InventarioAvatarService.deleteByIdAsync(${id})`);
    if (!id || Number.isNaN(id)) {
      throw new Error('El id del inventario es invalido.');
    }
    const rowsAffected = await this.InventarioAvatarRepository.deleteByIdAsync(id);
    return rowsAffected;
  };

  validarInventarioParaCrear = (entity) => {
    if (!entity) {
      throw new AppError('El inventario es obligatorio.', 400);
    }
    if (!entity.id_avatar) {
      throw new AppError('id_avatar es obligatorio.', 400);
    }
    if (!entity.id_item_avatar) {
      throw new AppError('id_item_avatar es obligatorio.', 400);
    }
    if (!entity.fecha_obtencion) {
      throw new AppError('fecha_obtencion es obligatorio.', 400);
    }
  };
}
