class ItemAvatar {
  constructor({
    id = null,
    id_tipo_item_avatar,
    nombre,
    codigo_item_externo = null,
    precio_punto,
    requiere_cantidad_actividad = null,
    requiere_id_dificultad_actividad = null,
    activo = true,
  }) {
    this.id = id;
    this.id_tipo_item_avatar = id_tipo_item_avatar;
    this.nombre = nombre;
    this.codigo_item_externo = codigo_item_externo;
    this.precio_punto = precio_punto;
    this.requiere_cantidad_actividad = requiere_cantidad_actividad;
    this.requiere_id_dificultad_actividad = requiere_id_dificultad_actividad;
    this.activo = activo;
  }
}

export default ItemAvatar;
