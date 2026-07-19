import PDFDocument from 'pdfkit';

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

export default class ReportePdfService {
  /**
   * Streamea un PDF de caseload mensual directamente a la respuesta HTTP.
   * Nunca incluye texto de notas de sesion — solo estadisticas agregadas y
   * el parrafo introductorio generado por Gemini.
   */
  streamCaseloadPdfAsync = async (res, { profesionalNombre, mes, anio, overviewText, pacientes }) => {
    console.log(`ReportePdfService.streamCaseloadPdfAsync(profesional=${profesionalNombre}, mes=${mes}, anio=${anio}, pacientes=${pacientes?.length ?? 0})`);
    const mesNombre = MESES[Number(mes) - 1] || String(mes);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="reporte-mensual-${anio}-${String(mes).padStart(2, '0')}.pdf"`);

    const doc = new PDFDocument({ margin: 50 });
    doc.on('error', (error) => {
      console.error('[ReportePdfService] Error generando PDF:', error.message);
      if (!res.headersSent) res.status(500);
      res.end();
    });
    doc.pipe(res);

    doc.fontSize(18).text(`Reporte mensual — ${mesNombre} ${anio}`, { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(11).fillColor('#666666').text(profesionalNombre, { align: 'center' });
    doc.fillColor('#000000');
    doc.moveDown(1.5);

    if (overviewText) {
      doc.fontSize(12).text(overviewText, { align: 'left' });
      doc.moveDown(1.5);
    }

    doc.fontSize(14).text('Detalle por paciente', { underline: true });
    doc.moveDown(0.5);

    if (!pacientes || pacientes.length === 0) {
      doc.fontSize(11).fillColor('#666666').text('No hubo sesiones registradas en este periodo.');
      doc.fillColor('#000000');
    }

    for (const paciente of pacientes || []) {
      doc.fontSize(13).text(paciente.pacienteNombre);
      doc.fontSize(10).fillColor('#444444').text(
        `Sesiones: ${paciente.totalSesiones}  ·  Completadas: ${paciente.completadas}  ·  Canceladas: ${paciente.canceladas}  ·  Ausencias: ${paciente.ausentes}  ·  Asistencia: ${paciente.asistenciaPct}%`,
      );
      doc.fillColor('#000000');
      doc.moveDown(0.7);
    }

    doc.end();
  };

  /**
   * Streamea el historial completo de un paciente (todas sus sesiones).
   * Documento puramente factual (sin texto generado por IA) — pensado para
   * imprimir o mandar a una obra social/institucion. Nunca incluye el
   * contenido de las notas, solo si existen o no.
   */
  streamPatientHistoryPdfAsync = async (res, { profesionalNombre, pacienteNombre, stats, sesiones }) => {
    console.log(`ReportePdfService.streamPatientHistoryPdfAsync(paciente=${pacienteNombre}, sesiones=${sesiones?.length ?? 0})`);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="historial-${pacienteNombre.replace(/\s+/g, '-').toLowerCase()}.pdf"`);

    const doc = new PDFDocument({ margin: 50 });
    doc.on('error', (error) => {
      console.error('[ReportePdfService] Error generando PDF:', error.message);
      if (!res.headersSent) res.status(500);
      res.end();
    });
    doc.pipe(res);

    doc.fontSize(18).text(`Historial de sesiones — ${pacienteNombre}`, { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(11).fillColor('#666666').text(`Profesional: ${profesionalNombre} · Generado el ${new Date().toLocaleDateString('es-AR')}`, { align: 'center' });
    doc.fillColor('#000000');
    doc.moveDown(1.5);

    doc.fontSize(12).text(
      `Total de sesiones: ${stats.total}  ·  Completadas: ${stats.completadas}  ·  Canceladas: ${stats.canceladas}  ·  Ausencias: ${stats.ausentes}  ·  Asistencia: ${stats.asistenciaPct}%`,
    );
    doc.moveDown(1.5);

    doc.fontSize(14).text('Detalle de sesiones', { underline: true });
    doc.moveDown(0.5);

    if (!sesiones || sesiones.length === 0) {
      doc.fontSize(11).fillColor('#666666').text('Este paciente todavia no tiene sesiones registradas.');
      doc.fillColor('#000000');
    }

    const colX = { fecha: 50, titulo: 130, estado: 320, duracion: 400, nota: 460 };
    doc.fontSize(9).fillColor('#666666');
    doc.text('Fecha', colX.fecha, doc.y, { continued: false, width: 75 });
    doc.text('Titulo', colX.titulo, doc.y - doc.currentLineHeight(), { continued: false, width: 180 });
    doc.text('Estado', colX.estado, doc.y - doc.currentLineHeight(), { continued: false, width: 70 });
    doc.text('Duracion', colX.duracion, doc.y - doc.currentLineHeight(), { continued: false, width: 55 });
    doc.text('Nota', colX.nota, doc.y - doc.currentLineHeight(), { continued: false, width: 50 });
    doc.fillColor('#000000');
    doc.moveDown(0.3);

    for (const sesion of sesiones || []) {
      if (doc.y > 720) doc.addPage();
      const rowY = doc.y;
      const fecha = new Date(sesion.fecha_sesion).toLocaleDateString('es-AR');
      doc.fontSize(9);
      doc.text(fecha, colX.fecha, rowY, { width: 75 });
      doc.text(sesion.titulo, colX.titulo, rowY, { width: 180 });
      doc.text(sesion.estado, colX.estado, rowY, { width: 70 });
      doc.text(`${sesion.duracion_minutos} min`, colX.duracion, rowY, { width: 55 });
      doc.text(sesion.has_note ? 'Si' : 'No', colX.nota, rowY, { width: 50 });
      doc.moveDown(0.6);
    }

    doc.end();
  };
}
