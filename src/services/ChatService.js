import ChatRepository from '../repositories/ChatRepository.js';
import BD from '../db/BD.js';
import PertenecienteRepository from '../repositories/PertenecienteRepository.js';
import ProfesionalRepository from '../repositories/ProfesionalRepository.js';
import TipoChatRepository from '../repositories/TipoChatRepository.js';
import UsuarioRepository from '../repositories/UsuarioRepository.js';
import VinculoProfesionalPertenecienteRepository from '../repositories/VinculoProfesionalPertenecienteRepository.js';

export default class ChatService {
  constructor() {
    console.log('Estoy en: ChatService.constructor()');
    this.ChatRepository = new ChatRepository();
    this.PertenecienteRepository = new PertenecienteRepository();
    this.ProfesionalRepository = new ProfesionalRepository();
    this.TipoChatRepository = new TipoChatRepository();
    this.UsuarioRepository = new UsuarioRepository();
    this.VinculoProfesionalPertenecienteRepository = new VinculoProfesionalPertenecienteRepository();
  }

  getAllAsync = async () => { console.log('ChatService.getAllAsync()'); const r = await this.ChatRepository.getAllAsync(); if (r == null) return null; return r; };
  getByIdAsync = async (id) => { console.log(`ChatService.getByIdAsync(${id})`); if (!id || Number.isNaN(id)) { throw new Error('El id del chat es invalido.'); } return await this.ChatRepository.getByIdAsync(id); };
  getByUsuarioIdAsync = async (idUsuario) => { console.log(`ChatService.getByUsuarioIdAsync(${idUsuario})`); if (!idUsuario || Number.isNaN(idUsuario)) { throw new Error('El id del usuario es invalido.'); } return await this.ChatRepository.getByUsuarioIdAsync(idUsuario); };
  createAsync = async (entity) => { console.log(`ChatService.createAsync(${JSON.stringify(entity)})`); this.validarChatParaCrear(entity); return await this.ChatRepository.createAsync(entity); };

  createProfesionalPertenecienteAsync = async ({ id_usuario_profesional, id_perteneciente, id_tipo_chat = null, nombre = null }) => {
    console.log(`ChatService.createProfesionalPertenecienteAsync(${JSON.stringify({ id_usuario_profesional, id_perteneciente, id_tipo_chat, nombre })})`);

    if (!id_usuario_profesional || Number.isNaN(id_usuario_profesional)) throw new Error('El usuario profesional autenticado es invalido.');
    if (!id_perteneciente || Number.isNaN(id_perteneciente)) throw new Error('id_perteneciente es obligatorio.');

    const profesional = await this.ProfesionalRepository.getByUsuarioIdAsync(id_usuario_profesional);
    if (!profesional) throw new Error('Solo un profesional puede crear este tipo de chat.');

    await this.validarProfesionalValidadoAsync(profesional.id);

    const perteneciente = await this.PertenecienteRepository.getByIdAsync(id_perteneciente);
    if (!perteneciente) throw new Error('No se encontro el perteneciente.');

    const usuarioPerteneciente = await this.UsuarioRepository.getByIdAsync(perteneciente.id_usuario);
    if (!usuarioPerteneciente?.activo) throw new Error('El usuario perteneciente no esta activo.');

    const esMayorDeEdad = this.esMayorDeEdad(usuarioPerteneciente.fecha_nacimiento);
    const vinculo = await this.VinculoProfesionalPertenecienteRepository.getByProfesionalYPertenecienteAsync(profesional.id, perteneciente.id);

    this.validarVinculoProfesionalPerteneciente(vinculo, esMayorDeEdad);

    const idTipoChat = await this.resolveTipoChatProfesionalPertenecienteAsync(id_tipo_chat);
    const existente = await this.ChatRepository.getActiveBetweenUsersAsync(id_usuario_profesional, perteneciente.id_usuario, idTipoChat);

    if (existente) {
      return { chat: existente, created: false };
    }

    const chat = await this.ChatRepository.createWithParticipantsAsync({
      id_tipo_chat: idTipoChat,
      nombre,
      fecha_creacion: new Date(),
      participantes: [id_usuario_profesional, perteneciente.id_usuario],
    });

    return { chat, created: true };
  };
  updateAsync = async (entity) => { console.log(`ChatService.updateAsync(${JSON.stringify(entity)})`); if (!entity?.id || Number.isNaN(entity.id)) { throw new Error('El id del chat es obligatorio para actualizar.'); } const prev = await this.ChatRepository.getByIdAsync(entity.id); if (prev == null) return 0; return await this.ChatRepository.updateAsync(entity); };
  deleteByIdAsync = async (id) => { console.log(`ChatService.deleteByIdAsync(${id})`); if (!id || Number.isNaN(id)) { throw new Error('El id del chat es invalido.'); } return await this.ChatRepository.deleteByIdAsync(id); };

  validarChatParaCrear = (entity) => {
    if (!entity) throw new Error('El chat es obligatorio.');
    if (!entity.id_tipo_chat) throw new Error('id_tipo_chat es obligatorio.');
    if (!entity.fecha_creacion) throw new Error('fecha_creacion es obligatorio.');
  };

  validarProfesionalValidadoAsync = async (idProfesional) => {
    const sql = `
      SELECT p.id
      FROM profesionales p
      INNER JOIN estados_validaciones_profesionales evp ON evp.id = p.id_estado_validacion
      WHERE p.id = $1
        AND LOWER(evp.nombre) IN ('validado', 'validada', 'aprobado', 'aprobada')
      LIMIT 1
    `;
    const validado = await BD.queryOne(sql, [idProfesional]);
    if (!validado) throw new Error('El profesional debe estar validado para crear chats con pertenecientes.');
  };

  validarVinculoProfesionalPerteneciente = (vinculo, esMayorDeEdad) => {
    if (!vinculo) {
      throw new Error('Debe existir un vinculo entre el profesional y el perteneciente.');
    }

    const estado = String(vinculo.estado_vinculo ?? '').toLowerCase();
    const vinculoActivo = ['activo', 'activa', 'aprobado', 'aprobada', 'aceptado', 'aceptada'].includes(estado);

    if (!vinculoActivo) {
      throw new Error('El vinculo profesional-perteneciente debe estar activo o aprobado.');
    }

    if (!esMayorDeEdad && (!vinculo.fue_aprobado_por_tutor || !vinculo.id_tutor_aprobador)) {
      throw new Error('El tutor debe aprobar el vinculo antes de crear el chat con un perteneciente menor de edad.');
    }
  };

  resolveTipoChatProfesionalPertenecienteAsync = async (idTipoChat) => {
    if (idTipoChat) return idTipoChat;

    const nombres = ['profesional_perteneciente', 'profesional-perteneciente', 'profesional perteneciente'];

    for (const nombre of nombres) {
      const tipo = await this.TipoChatRepository.getByNombreAsync(nombre);
      if (tipo) return tipo.id;
    }

    throw new Error('No se encontro el tipo de chat profesional-perteneciente. Envia id_tipo_chat o crea el catalogo correspondiente.');
  };

  esMayorDeEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return false;

    const nacimiento = new Date(fechaNacimiento);
    if (Number.isNaN(nacimiento.getTime())) return false;

    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad -= 1;
    }

    return edad >= 18;
  };
}
