import BD from '../db/BD.js';

const ESTADOS_VINCULO_ACTIVOS = ['activo', 'activa', 'aprobado', 'aprobada', 'aceptado', 'aceptada'];
const REALERTA_DIAS = 7;

export default class PacienteInactivoRepository {
  constructor() {
    console.log('Estoy en: PacienteInactivoRepository.constructor()');
  }

  /**
   * Vinculos activos donde el paciente no tiene ninguna sesion en los
   * ultimos `thresholdDays` dias NI ninguna sesion programada a futuro, y
   * no se le mando una alerta de inactividad en los ultimos 7 dias (evita
   * re-notificar todos los dias apenas cruza el umbral).
   */
  getInactivosAsync = async (thresholdDays = 14) => {
    console.log(`PacienteInactivoRepository.getInactivosAsync(${thresholdDays})`);
    const sql = `
      SELECT vpp.id_profesional, vpp.id_perteneciente, prof.id_usuario AS id_usuario_profesional
      FROM vinculos_profesional_pertenecientes vpp
      JOIN estados_vinculos ev ON ev.id = vpp.id_estado_vinculo
      JOIN profesionales prof ON prof.id = vpp.id_profesional
      WHERE LOWER(ev.nombre) = ANY($1::text[])
        AND NOT EXISTS (
          SELECT 1 FROM sesiones_profesionales s
          WHERE s.id_profesional = vpp.id_profesional
            AND s.id_perteneciente = vpp.id_perteneciente
            AND (
              (s.estado = 'programada' AND s.fecha_sesion >= NOW())
              OR s.fecha_sesion >= NOW() - ($2 || ' days')::interval
            )
        )
        AND NOT EXISTS (
          SELECT 1 FROM notificaciones n
          WHERE n.reference_type = 'paciente_inactivo'
            AND n.reference_id = vpp.id_perteneciente
            AND n.id_usuario_destino = prof.id_usuario
            AND n.fecha_creacion >= NOW() - ($3 || ' days')::interval
        )
    `;
    return await BD.query(sql, [ESTADOS_VINCULO_ACTIVOS, thresholdDays, REALERTA_DIAS]);
  };
}
