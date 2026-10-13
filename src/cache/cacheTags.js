import { invalidateCache } from './cacheHelper.js';
import { invalidateAccountCache } from './accountCache.js';

// Etiquetas de invalidacion compartidas por los services que leen/escriben
// los mismos datos. Una escritura invalida la etiqueta; todas las claves
// (de todos los usuarios) que dependian de ese dato se borran juntas.
export const CACHE_TAGS = Object.freeze({
  AUTHZ: 'authz',
  USUARIOS: 'usuarios',
  PERTENECIENTES: 'pertenecientes',
  VINCULOS_TUTOR: 'vinculos-tutor',
  TUTORES: 'tutores',
  PROFESSIONAL_DIRECTORY: 'profesionales-directory',
  AI_CREATIONS: 'ai-creations',
  catalog: (table) => `catalog:${table}`,
});

// TTLs (segundos) segun que tan seguido cambia cada dato.
export const CACHE_TTL = Object.freeze({
  AUTHZ_USER_CONTEXT: 60,
  PERSONAL_LIST: 60,
  TUTOR_PROFILE: 120,
  AI_CREATIONS: 60,
  PROFESSIONAL_DIRECTORY: 300,
  CATALOG: 30 * 60,
});

/** Vinculos, permisos o roles cambiaron: todo lo que depende de "quien puede ver que". */
export async function invalidateAuthorizationCaches() {
  await invalidateCache({
    tags: [CACHE_TAGS.AUTHZ, CACHE_TAGS.PERTENECIENTES, CACHE_TAGS.VINCULOS_TUTOR],
  });
}

/** Cambio un usuario (datos, rol, activo, email, contrasena) o su sesion. */
export async function invalidateUserCaches(idUsuario) {
  await invalidateAccountCache(idUsuario);
  await invalidateCache({
    tags: [CACHE_TAGS.USUARIOS, CACHE_TAGS.TUTORES, CACHE_TAGS.PROFESSIONAL_DIRECTORY],
  });
}
