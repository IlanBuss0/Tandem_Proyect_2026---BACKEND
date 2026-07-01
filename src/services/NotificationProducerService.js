import BD from '../db/BD.js';
import NotificacionRepository from '../repositories/NotificacionRepository.js';
import { emitToUser } from '../realtime/realtime.js';

export default class NotificationProducerService {
  constructor() {
    this.repository = new NotificacionRepository();
  }

  createAsync = async ({ recipientUserId, actorUserId = null, contextUserId = null, typeName = 'Información', title, body = null, referenceType, referenceId }) => {
    try {
      const type = await BD.queryOne(
        `SELECT id FROM tipos_notificaciones WHERE LOWER(nombre) = LOWER($1) ORDER BY id LIMIT 1`,
        [typeName],
      ) || await BD.queryOne(`SELECT id FROM tipos_notificaciones WHERE LOWER(nombre) = 'información' OR LOWER(nombre) = 'informacion' ORDER BY id LIMIT 1`);
      if (!type) throw new Error('No existe un tipo de notificacion utilizable.');

      const id = await this.repository.createAsync({
        id_usuario_destino: recipientUserId,
        id_usuario_actor: actorUserId,
        id_tipo_notificacion: type.id,
        titulo: title,
        cuerpo: body,
        leida: false,
        fecha_creacion: new Date(),
        reference_type: referenceType,
        reference_id: referenceId,
        context_user_id: contextUserId,
      });
      emitToUser(recipientUserId, 'notification:new', { id, reference_type: referenceType, reference_id: referenceId });
      return id;
    } catch (error) {
      console.error('[Notifications] creation failed', {
        recipientUserId,
        referenceType,
        referenceId,
        error: error.message,
      });
      return 0;
    }
  };
}
