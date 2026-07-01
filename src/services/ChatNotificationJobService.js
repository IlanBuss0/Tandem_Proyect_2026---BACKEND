import MensajeRepository from '../repositories/MensajeRepository.js';
import ParticipanteChatService from './ParticipanteChatService.js';
import NotificacionRepository from '../repositories/NotificacionRepository.js';
import { emitToUser } from '../realtime/realtime.js';
import BD from '../db/BD.js';

export default class ChatNotificationJobService {
  constructor() {
    this.MensajeRepository = new MensajeRepository();
    this.ParticipanteChatService = new ParticipanteChatService();
    this.NotificacionRepository = new NotificacionRepository();
  }

  processMessageNotificationsAsync = async ({ messageId }) => {
    const message = await this.MensajeRepository.getByIdAsync(messageId);
    if (!message) return { created: 0 };

    const participantes = await this.ParticipanteChatService.getByChatIdAsync(message.id_chat);
    const destinatarios = participantes.filter((participante) => (
      participante.id_usuario !== message.id_usuario_emisor && !participante.fecha_salida
    ));

    if (destinatarios.length === 0) return { created: 0 };

    const tipoChat = await BD.queryOne("SELECT id FROM tipos_notificaciones WHERE LOWER(nombre) = 'chat'");
    const idTipoChat = tipoChat ? tipoChat.id : 2;
    const cuerpo = message.contenido ? message.contenido.substring(0, 50) : null;

    const notificaciones = destinatarios.map((destinatario) => ({
      id_usuario_destino: destinatario.id_usuario,
      id_usuario_actor: message.id_usuario_emisor,
      id_tipo_notificacion: idTipoChat,
      titulo: 'Nuevo mensaje',
      cuerpo,
      leida: false,
      fecha_creacion: new Date(),
      fecha_lectura: null,
      reference_type: 'chat',
      reference_id: message.id_chat,
      context_user_id: message.id_usuario_emisor,
    }));

    const created = await this.NotificacionRepository.createManyAsync(notificaciones);

    for (const destinatario of destinatarios) {
      emitToUser(destinatario.id_usuario, 'notification:new', {
        type: 'chat_message',
        id_chat: message.id_chat,
        id_mensaje: message.id,
        contenido: message.contenido,
        id_usuario_emisor: message.id_usuario_emisor,
        reference_type: 'chat',
        reference_id: message.id_chat,
      });
    }

    return { created };
  };
}
