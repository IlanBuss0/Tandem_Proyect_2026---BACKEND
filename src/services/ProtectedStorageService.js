import axios from 'axios';
import BD from '../db/BD.js';
import { envConfig } from '../configs/env.config.js';
import AuthorizationService from './AuthorizationService.js';
import AppError from '../modules/errors/AppError.js';

const buckets = () => [envConfig.supabaseFilesBucket, envConfig.supabaseAvatarBucket];
export function parseStorageObject(value) {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value, envConfig.supabaseUrl);
    if (url.origin !== new URL(envConfig.supabaseUrl).origin) return null;
    const match = url.pathname.match(/^\/storage\/v1\/object\/(?:public\/|authenticated\/)?([^/]+)\/(.+)$/);
    if (!match || !buckets().includes(match[1])) return null;
    const path = decodeURIComponent(match[2]);
    if (path.split('/').some(part => part === '..' || part === '.' || !part) || path.includes('\\')) return null;
    return { bucket: match[1], path };
  } catch { return null; }
}

export function protectStorageUrls(value, origin = envConfig.appPublicUrl.replace(/\/$/, '')) {
  if (typeof value === 'string') {
    // Activity descriptions also contain serialized JSON with image URLs.
    return value.replace(/https?:\/\/[^\s"'<>\\]+/g, url => {
      const object = parseStorageObject(url);
      return object ? `${origin}/api/storage/${object.bucket}/${object.path.split('/').map(encodeURIComponent).join('/')}` : url;
    });
  }
  if (Array.isArray(value)) return value.map(item => protectStorageUrls(item, origin));
  if (value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, protectStorageUrls(item, origin)]));
  }
  return value;
}

function objectUrl(bucket, path) {
  if (!buckets().includes(bucket) || !path || path.includes('\\') || path.split('/').some(part => !part || part === '.' || part === '..')) throw new AppError('Objeto no valido.', 400);
  return `${envConfig.supabaseUrl}/storage/v1/object/${bucket}/${path.split('/').map(encodeURIComponent).join('/')}`;
}

export default class ProtectedStorageService {
  async assertPrivateBuckets() {
    const rows = await BD.query('SELECT id, public FROM storage.buckets WHERE id=ANY($1::text[])', [buckets()]);
    if (buckets().some(id => !rows.some(row => row.id === id && row.public === false))) throw new Error('Los buckets de archivos y avatares deben existir y ser privados.');
  }

  publicUrl(bucket, path) { return `${envConfig.supabaseUrl}/storage/v1/object/public/${bucket}/${path}`; }

  async isPublishedPictogram(bucket, path) {
    if (bucket !== envConfig.supabaseFilesBucket) return false;
    return Boolean(await BD.queryOne("SELECT id FROM pictogramas WHERE url=$1 AND origen='TANDEM_AI' AND estado_publicacion='approved' LIMIT 1", [this.publicUrl(bucket, path)]));
  }

  async assertAccess(userId, bucket, path) {
    objectUrl(bucket, path);
    if (bucket === envConfig.supabaseAvatarBucket) {
      const avatar = await BD.queryOne('SELECT * FROM avatares WHERE avatar_imagen_path=$1', [path]);
      if (avatar) return AuthorizationService.assertCanReadPertenecienteResource(userId, Number(avatar.id_perteneciente), 'VerHistorial');
    }
    if (bucket === envConfig.supabaseFilesBucket) {
      const file = await BD.queryOne('SELECT * FROM archivos WHERE url=$1', [this.publicUrl(bucket, path)]);
      if (file) return AuthorizationService.assertCanReadFile(userId, file);
      const chat = await BD.queryOne(`SELECT pc.id FROM chats c JOIN participantes_chats pc ON pc.id_chat=c.id
        WHERE c.avatar_path=$1 AND pc.id_usuario=$2 AND pc.fecha_salida IS NULL`, [path, userId]);
      if (chat) return;
      const generation = await BD.queryOne(`SELECT id_usuario_creador FROM generaciones_pictogramas_ia
        WHERE (preview_path=$1 OR $1=ANY(string_to_array(referencia_path, E'\\n'))) AND estado <> 'discarded'`, [path]);
      if (Number(generation?.id_usuario_creador) === Number(userId)) return;
      const pictogram = await BD.queryOne(`SELECT id_perteneciente_destino FROM pictogramas
        WHERE url=$1 AND origen='TANDEM_AI' AND estado_publicacion='private'`, [this.publicUrl(bucket, path)]);
      if (pictogram) return AuthorizationService.assertCanReadPertenecienteResource(userId, Number(pictogram.id_perteneciente_destino), 'VerHistorial');
    }
    throw new AppError('No autorizado para acceder al objeto.', 403);
  }

  async download(bucket, path) {
    return axios.get(objectUrl(bucket, path), {
      responseType: 'arraybuffer', timeout: 30000, maxContentLength: 12 * 1024 * 1024,
      headers: { apikey: envConfig.supabaseServiceRoleKey, Authorization: `Bearer ${envConfig.supabaseServiceRoleKey}` },
    });
  }

  async signProviderReference(url) {
    const object = parseStorageObject(url);
    if (!object) return url;
    const { data } = await axios.post(`${envConfig.supabaseUrl}/storage/v1/object/sign/${object.bucket}/${object.path}`, { expiresIn: 120 }, {
      timeout: 15000, headers: { apikey: envConfig.supabaseServiceRoleKey, Authorization: `Bearer ${envConfig.supabaseServiceRoleKey}` },
    });
    return `${envConfig.supabaseUrl}/storage/v1${data.signedURL}`;
  }
}
