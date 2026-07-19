import PacienteInactivoRepository from '../repositories/PacienteInactivoRepository.js';
import PertenecienteRepository from '../repositories/PertenecienteRepository.js';
import UsuarioRepository from '../repositories/UsuarioRepository.js';
import NotificationProducerService from '../services/NotificationProducerService.js';

const INACTIVE_THRESHOLD_DAYS = 14;
const CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000; // cada 6hs alcanza, la deduplicacion evita spam diario

const inactivosRepository = new PacienteInactivoRepository();
const pertenecienteRepository = new PertenecienteRepository();
const usuarioRepository = new UsuarioRepository();
const producer = new NotificationProducerService();
let running = false;

export async function processInactivePatientAlerts() {
  if (running) return;
  running = true;
  try {
    for (const row of await inactivosRepository.getInactivosAsync(INACTIVE_THRESHOLD_DAYS)) {
      try {
        const perteneciente = await pertenecienteRepository.getByIdAsync(row.id_perteneciente);
        const usuario = perteneciente ? await usuarioRepository.getByIdAsync(perteneciente.id_usuario) : null;
        const nombre = usuario?.nombre || usuario?.nombre_usuario || 'Un paciente';

        await producer.createAsync({
          recipientUserId: row.id_usuario_profesional,
          contextUserId: row.id_usuario_profesional,
          typeName: 'Alerta',
          title: 'Paciente sin sesiones recientes',
          body: `${nombre} no tiene sesiones hace ${INACTIVE_THRESHOLD_DAYS} días ni una próxima agendada.`,
          referenceType: 'paciente_inactivo',
          referenceId: row.id_perteneciente,
        });
      } catch (error) {
        console.error(`[Inactive patients] error alertando perteneciente ${row.id_perteneciente}:`, error.message);
      }
    }
  } finally {
    running = false;
  }
}

function runSafely() {
  processInactivePatientAlerts().catch((error) => console.error('[Inactive patients] worker error:', error.message));
}

export function startInactivePatientWorker() {
  runSafely();
  return setInterval(runSafely, CHECK_INTERVAL_MS);
}
