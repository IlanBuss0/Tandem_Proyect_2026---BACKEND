// Unico lugar donde se decide cuantos proxies confia Express para leer la IP
// real del visitante (req.ip) de X-Forwarded-For. Nunca devuelve `true`: con
// "confiar en todo" cualquiera podria falsificar su IP mandando ese header y
// esquivar los rate limiters. Poner MAS saltos de los reales tiene el mismo
// efecto, por eso la cantidad es configurable.
//
// TRUST_PROXY_HOPS: entero >= 0 (0 = no confiar en ningun proxy).
//   - 1: el frontend llama directo a Railway.
//   - 2: el frontend pasa por el rewrite /api de Vercel (Vercel -> Railway -> app).
// Sin definir: 1 en produccion (Railway siempre es un proxy), false en desarrollo.
export function resolveTrustProxy(env = process.env, warn = console.warn) {
  const fallback = env.NODE_ENV === 'production' ? 1 : false;
  const raw = env.TRUST_PROXY_HOPS;
  if (raw === undefined || String(raw).trim() === '') return fallback;

  const text = String(raw).trim();
  if (!/^\d+$/.test(text)) {
    warn(`[trust proxy] TRUST_PROXY_HOPS invalido (se espera un entero >= 0); se usa el valor por defecto (${fallback}).`);
    return fallback;
  }
  const hops = Number(text);
  return hops === 0 ? false : hops;
}
