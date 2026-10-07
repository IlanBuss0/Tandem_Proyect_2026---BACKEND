import AppError from '../modules/errors/AppError.js';
import AuthorizationService from './AuthorizationService.js';
import UsuarioRepository from '../repositories/UsuarioRepository.js';
import HelpAlertService, { HELP_MOTIVOS, cleanHelpText } from './HelpAlertService.js';

const CONTEXTOS = ['rutina', 'comunicador'];
const COMUNICADOR_MOTIVOS = ['ayuda', 'pausa'];
const TITULO_MAX = 80;
const PASO_TEXTO_MAX = 200;
const FRASE_MAX = 80;
const FRASE_POR_DEFECTO = 'Necesito espacio';

// Sin mayusculas, tildes ni espacios de mas: "Lavarse  los DIENTES" == "lavarse los dientes".
const normalizeTitle = (title) => String(title).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

const toPositiveInteger = (value) => {
  if (typeof value === 'boolean' || value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isInteger(number) && number >= 1 ? number : null;
};

/**
 * Unica responsabilidad: pedido de ayuda general del perteneciente desde una
 * rutina de "Mi dia" o desde "No puedo hablar" (las actividades asignadas
 * tienen su propio metodo). Valida, arma los textos y delega el envio en
 * HelpAlertService.
 */
export default class AyudaService {
  constructor() {
    this.UsuarioRepository = new UsuarioRepository();
    this.HelpAlertService = new HelpAlertService();
  }

  requestAsync = async (idUsuario, { contexto, motivo, titulo, paso, totalPasos, pasoTexto, frase } = {}) => {
    if (!CONTEXTOS.includes(contexto)) throw new AppError('El contexto es invalido.', 400);
    if (!HELP_MOTIVOS.includes(motivo)) throw new AppError('El motivo es invalido.', 400);
    if (contexto === 'comunicador' && !COMUNICADOR_MOTIVOS.includes(motivo)) {
      throw new AppError('Desde "No puedo hablar" el motivo solo puede ser ayuda o pausa.', 400);
    }

    const cleanTitulo = cleanHelpText(titulo, TITULO_MAX);
    const cleanPasoTexto = cleanHelpText(pasoTexto, PASO_TEXTO_MAX);
    const cleanFrase = cleanHelpText(frase, FRASE_MAX);
    let numericPaso = null;
    let numericTotal = null;

    if (contexto === 'rutina') {
      if (!cleanTitulo) throw new AppError('El titulo de la rutina es obligatorio.', 400);
      numericPaso = toPositiveInteger(paso);
      if (numericPaso === null) throw new AppError('El paso debe ser un entero mayor o igual a 1.', 400);
      if (totalPasos !== undefined && totalPasos !== null) {
        numericTotal = toPositiveInteger(totalPasos);
        if (numericTotal === null || numericTotal < numericPaso) {
          throw new AppError('totalPasos debe ser un entero mayor o igual al paso.', 400);
        }
      }
    }

    const userContext = await AuthorizationService.getUserContext(idUsuario);
    const idPerteneciente = userContext?.perteneciente?.id;
    if (!idPerteneciente) throw new AppError('Solo una persona con perfil de perteneciente puede pedir ayuda.', 403);

    const usuario = await this.UsuarioRepository.getByIdAsync(Number(idUsuario));
    const nombre = String(usuario?.nombre || '').trim().split(/\s+/)[0] || 'Tu familiar';
    const title = motivo === 'ayuda' ? `${nombre} pidió ayuda`
      : motivo === 'no_entiende' ? `${nombre} no entiende un paso`
        : `${nombre} se está tomando una pausa`;

    if (contexto === 'comunicador') {
      const body = motivo === 'ayuda'
        ? 'Lo pidió desde «No puedo hablar».'
        : `Eligió «${cleanFrase || FRASE_POR_DEFECTO}» en «No puedo hablar». Quiso que lo sepas.`;
      return await this.HelpAlertService.sendAsync({
        idUsuario,
        idPerteneciente,
        motivo,
        title,
        body,
        cacheKey: `ayuda.comunicador.${idUsuario}.${motivo}`,
        referenceId: null,
        usageEvent: {
          entidadTipo: 'comunicador',
          entidadId: 'no_puedo_hablar',
          valor: { contexto: 'comunicador', motivo, ...(cleanFrase ? { frase: cleanFrase } : {}) },
        },
      });
    }

    const pasoLabel = numericTotal ? `paso ${numericPaso} de ${numericTotal}` : `paso ${numericPaso}`;
    const detalle = cleanPasoTexto ? `${pasoLabel}: ${cleanPasoTexto}` : `${pasoLabel}.`;
    const body = motivo === 'pausa'
      ? `Estaba en «${cleanTitulo}», ${pasoLabel}. Quiso que lo sepas.`
      : `En «${cleanTitulo}», ${detalle}`;
    const normalizedTitle = normalizeTitle(cleanTitulo);
    return await this.HelpAlertService.sendAsync({
      idUsuario,
      idPerteneciente,
      motivo,
      title,
      body,
      cacheKey: `ayuda.rutina.${idUsuario}.${motivo}.${normalizedTitle}.${numericPaso}`,
      referenceId: null,
      usageEvent: {
        entidadTipo: 'rutina',
        entidadId: normalizedTitle,
        valor: {
          contexto: 'rutina',
          motivo,
          paso: numericPaso,
          ...(numericTotal ? { totalPasos: numericTotal } : {}),
          titulo: cleanTitulo,
          ...(cleanPasoTexto ? { pasoTexto: cleanPasoTexto } : {}),
        },
      },
    });
  };
}
