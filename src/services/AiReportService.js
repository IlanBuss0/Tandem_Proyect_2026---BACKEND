import axios from 'axios';
import { envConfig } from '../configs/env.config.js';
import AppError from '../modules/errors/AppError.js';

const GROQ_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL_NAME = 'llama-3.3-70b-versatile';

const PATIENT_SUMMARY_SYSTEM_PROMPT = `Sos un asistente que ayuda a profesionales (psicologos, terapeutas) a redactar resumenes de progreso para las familias/tutores de pacientes con TEA (Trastorno del Espectro Autista). Tu resumen va a ser leido directamente por un padre/madre/tutor, NO por otro profesional.

Reglas:
1. Usa lenguaje claro, calido y sin jerga clinica. Evita terminos como "conducta disruptiva", "estereotipias", diagnosticos o codificaciones; si el material de origen los usa, traducilos a lenguaje cotidiano.
2. Nunca uses un tono alarmista ni etiquetes a la persona ("el autista", "el paciente") — referite a ella por su progreso y esfuerzo.
3. Estructura sugerida: un parrafo de apertura general, 2 a 4 puntos concretos de avances o temas trabajados, y un cierre alentador.
4. No inventes informacion que no este en los datos provistos.
5. Extension: 150 a 300 palabras.
6. Respondiendo en espanol rioplatense, en texto plano (sin markdown, sin titulos con #).`;

const CASELOAD_OVERVIEW_SYSTEM_PROMPT = `Sos un asistente que redacta la introduccion de un reporte mensual de casos para un profesional que atiende pacientes con TEA. El texto es para uso del propio profesional (no para las familias), asi que podes ser mas directo y usar terminos de seguimiento de casos, pero segui siendo respetuoso y basate solo en las estadisticas provistas: no inventes diagnosticos ni juicios clinicos.

Escribi un parrafo de 3 a 5 oraciones resumiendo el mes: cantidad total de sesiones, asistencia general, y cualquier patron notable (ej. pacientes sin sesion, buena adherencia, etc.) que se desprenda de los numeros. Texto plano, sin markdown.`;

function formatSesionesList(sesiones) {
  return sesiones
    .map((s) => `- ${s.titulo} (${new Date(s.fecha_sesion).toLocaleDateString('es-AR')}) — estado: ${s.estado}`)
    .join('\n');
}

export default class AiReportService {
  constructor() {
    console.log('Estoy en: AiReportService.constructor()');
    this.apiKey = envConfig.groqApiKey || null;
  }

  assertConfigured = () => {
    if (!this.apiKey) {
      throw new AppError('GROQ_API_KEY no configurado.', 503);
    }
  };

  generateContentSafe = async (systemPrompt, userPrompt) => {
    this.assertConfigured();
    try {
      const response = await axios.post(GROQ_CHAT_URL, {
        model: MODEL_NAME,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
      }, {
        headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
        timeout: 30000,
      });
      const text = response?.data?.choices?.[0]?.message?.content;
      if (!text || !text.trim()) {
        throw new Error('Respuesta vacia del proveedor de IA.');
      }
      return text.trim();
    } catch (error) {
      // Nunca logueamos el prompt (puede contener texto de notas de sesion) —
      // solo el mensaje de error del proveedor.
      const providerMessage = error?.response?.data?.error?.message || error.message;
      console.error('[AiReportService] Error generando contenido:', providerMessage);
      throw new AppError('No se pudo generar el resumen con IA. Intenta de nuevo en unos minutos.', 502);
    }
  };

  /**
   * notasTexto es null para reportes programados (sin frontend disponible
   * para leer Google Docs) — en ese caso el resumen se arma solo con
   * metadata de sesiones, nunca con contenido de notas.
   */
  generatePatientSummaryAsync = async ({ pacienteNombre, nivelApoyoNombre, sesiones, notasTexto = null }) => {
    console.log(`AiReportService.generatePatientSummaryAsync(paciente=${pacienteNombre}, sesiones=${sesiones?.length ?? 0}, notas=${notasTexto?.length ?? 0})`);

    const lines = [
      `Paciente: ${pacienteNombre}`,
      nivelApoyoNombre ? `Nivel de apoyo registrado: ${nivelApoyoNombre}` : null,
      `Cantidad de sesiones consideradas: ${sesiones.length}`,
      '',
      'Sesiones:',
      formatSesionesList(sesiones),
    ].filter((line) => line !== null);

    if (notasTexto && notasTexto.length > 0) {
      lines.push('', 'Notas de las sesiones seleccionadas por el profesional:');
      for (const nota of notasTexto) {
        lines.push(`\n[Sesion: ${nota.titulo} — ${new Date(nota.fecha_sesion).toLocaleDateString('es-AR')}]\n${nota.texto}`);
      }
    } else {
      lines.push('', 'No hay contenido de notas clinicas disponible para este resumen automatico; basate solo en la cantidad y frecuencia de sesiones.');
    }

    const contenido = await this.generateContentSafe(PATIENT_SUMMARY_SYSTEM_PROMPT, lines.join('\n'));
    const titulo = `Reporte de progreso — ${pacienteNombre} — ${new Date().toLocaleDateString('es-AR')}`;
    return { titulo, contenido };
  };

  generateCaseloadOverviewAsync = async ({ profesionalNombre, mes, anio, resumenPorPaciente }) => {
    console.log(`AiReportService.generateCaseloadOverviewAsync(profesional=${profesionalNombre}, pacientes=${resumenPorPaciente?.length ?? 0})`);

    const statsLines = resumenPorPaciente.map((p) =>
      `- ${p.pacienteNombre}: ${p.totalSesiones} sesiones (${p.completadas} completadas, ${p.canceladas} canceladas, ${p.ausentes} ausencias) — asistencia ${p.asistenciaPct}%`,
    );

    const prompt = [
      `Profesional: ${profesionalNombre}`,
      `Periodo: ${mes}/${anio}`,
      '',
      'Estadisticas por paciente:',
      ...statsLines,
    ].join('\n');

    return await this.generateContentSafe(CASELOAD_OVERVIEW_SYSTEM_PROMPT, prompt);
  };
}
