import TareaReporteProgramadoRepository from '../repositories/TareaReporteProgramadoRepository.js';
import ReporteProfesionalService from '../services/ReporteProfesionalService.js';

const tareaRepository = new TareaReporteProgramadoRepository();
const reporteService = new ReporteProfesionalService();
let running = false;

export async function processScheduledReports() {
  if (running) return;
  running = true;
  try {
    for (const tarea of await tareaRepository.claimDueAsync()) {
      try {
        const reporte = await reporteService.generateScheduledAsync(tarea.id_profesional, tarea.id_perteneciente);
        if (tarea.enviar_automatico) {
          // El profesional dueño de la tarea es quien "manda" el mensaje;
          // resolvemos su id_usuario a partir del id_profesional guardado.
          const idUsuarioProfesional = await reporteService.resolveProfesionalUsuarioIdAsync(tarea.id_profesional);
          await reporteService.sendToTutorAsync(reporte.id, idUsuarioProfesional, tarea.id_profesional);
        }
      } catch (error) {
        console.error(`[Scheduled reports] error procesando tarea ${tarea.id}:`, error.message);
      }
    }
  } finally {
    running = false;
  }
}

function runSafely() {
  processScheduledReports().catch((error) => console.error('[Scheduled reports] worker error:', error.message));
}

export function startScheduledReportWorker() {
  runSafely();
  return setInterval(runSafely, 30000);
}
