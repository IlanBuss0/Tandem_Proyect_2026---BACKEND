class Avatar {
  constructor({
    id = null,
    id_perteneciente,
    nivel = 1,
    experiencia = 0,
    avatar_api = null,
    avatar_externo_id = null,
    avatar_json = null,
  }) {
    this.id = id;
    this.id_perteneciente = id_perteneciente;
    this.nivel = nivel;
    this.experiencia = experiencia;
    this.avatar_api = avatar_api;
    this.avatar_externo_id = avatar_externo_id;
    this.avatar_json = avatar_json;
  }
}

export default Avatar;
