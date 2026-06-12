class Avatar {
  constructor({
    id = null,
    id_perteneciente,
    nivel = 1,
    experiencia = 0,
    avatar_api = null,
    avatar_externo_id = null,
    avatar_json = null,
    avatar_imagen_url = null,
    avatar_imagen_path = null,
    avatar_imagen_content_type = null,
    avatar_imagen_actualizada_en = null,
    avatar_imagen_origen_url = null,
  }) {
    this.id = id;
    this.id_perteneciente = id_perteneciente;
    this.nivel = nivel;
    this.experiencia = experiencia;
    this.avatar_api = avatar_api;
    this.avatar_externo_id = avatar_externo_id;
    this.avatar_json = avatar_json;
    this.avatar_imagen_url = avatar_imagen_url;
    this.avatar_imagen_path = avatar_imagen_path;
    this.avatar_imagen_content_type = avatar_imagen_content_type;
    this.avatar_imagen_actualizada_en = avatar_imagen_actualizada_en;
    this.avatar_imagen_origen_url = avatar_imagen_origen_url;
  }
}

export default Avatar;
