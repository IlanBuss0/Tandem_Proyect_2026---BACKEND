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
}
