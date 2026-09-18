import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import RefepsPublicProvider from '../providers/professional-verification/RefepsPublicProvider.js';

const router = Router();
const registryProvider = new RefepsPublicProvider();

router.post('/details', async (req, res) => {
  res.set('Cache-Control', 'no-store');
  try {
    const data = await registryProvider.obtenerPerfil(req.body);
    return res.status(StatusCodes.OK).json({ ok: true, data });
  } catch (error) {
    const invalid = ['INVALID_SELECTION', 'SELECTION_EXPIRED'].includes(error.code);
    return res.status(invalid ? StatusCodes.BAD_REQUEST : StatusCodes.BAD_GATEWAY).json({
      ok: false,
      code: error.code || 'PROFESSIONAL_DETAILS_UNAVAILABLE',
      error: error.code === 'SELECTION_EXPIRED' ? 'La selección del registro venció. Buscá nuevamente al profesional.' : invalid ? 'Seleccioná nuevamente tu registro profesional.' : 'No pudimos consultar el registro profesional en este momento. Intentá nuevamente.',
    });
  }
});

router.post('/search-refeps', async (req, res) => {
  try {
    const matricula = String(req.body?.matricula || '').trim();
    const dni = String(req.body?.dni || '').replace(/\D/g, '');
    if (matricula && dni) return res.status(StatusCodes.BAD_REQUEST).json({ ok: false, error: 'Ingresá una matrícula o un DNI.', code: 'INVALID_SEARCH' });
    if (matricula && !/^\d{4,}$/.test(matricula)) {
      return res.status(StatusCodes.BAD_REQUEST).json({ ok: false, error: 'La matrícula debe tener al menos 4 dígitos.', code: 'INVALID_LICENSE' });
    }
    if (dni && !/^\d{7,8}$/.test(dni)) return res.status(StatusCodes.BAD_REQUEST).json({ ok: false, error: 'El DNI debe tener 7 u 8 dígitos.', code: 'INVALID_DNI' });
    if (!matricula && !dni) return res.status(StatusCodes.BAD_REQUEST).json({ ok: false, error: 'Ingresá una matrícula o un DNI.', code: 'INVALID_SEARCH' });
    const result = dni ? await registryProvider.buscarPorDni(dni) : await registryProvider.buscarPorMatricula(matricula);
    return res.status(StatusCodes.OK).json({ ok: true, data: result });
  } catch (error) {
    console.error('[ProfessionalRegistrySearch] Error:', error.code || error.name);
    return res.status(StatusCodes.BAD_GATEWAY).json({ ok: false, error: 'No pudimos consultar el registro profesional en este momento. Intentá nuevamente.' });
  }
});

export default router;
