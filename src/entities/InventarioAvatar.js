class InventarioAvatar {
  constructor({
    id = null,
    id_avatar,
    id_item_avatar,
    equipado = false,
    fecha_obtencion,
  }) {
    this.id = id;
    this.id_avatar = id_avatar;
    this.id_item_avatar = id_item_avatar;
    this.equipado = equipado;
    this.fecha_obtencion = fecha_obtencion;
  }
}

export default InventarioAvatar;
