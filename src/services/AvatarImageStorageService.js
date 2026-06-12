import axios from 'axios';
import { envConfig } from '../configs/env.config.js';

const DEFAULT_APPEARANCE = {
  genero: 'neutral',
  colorPiel: 'medio',
  formaCara: 'redonda',
  peinado: 'corto',
  colorPelo: 'castanio',
  expresion: 'feliz',
};

const DEFAULT_EQUIPPED = {
  ropa: 'shirt-blue',
  fondo: 'bg-default',
};

const SKIN_COLOR = {
  claro: 'ffdbb4',
  medio: 'd08b5b',
  oscuro: '614335',
};

const HAIR_STYLE = {
  corto: 'shortWaved',
  largo: 'straight02',
  rizado: 'curly',
  rapado: 'hat',
};

const GENDER_PRESET = {
  neutral: {
    eyebrows: 'default',
    mouth: 'smile',
  },
  femenino: {
    eyebrows: 'raisedExcited',
    mouth: 'smile',
  },
  masculino: {
    eyebrows: 'defaultNatural',
    mouth: 'smile',
    facialHair: 'beardLight',
  },
};

const FACE_PRESET = {
  redonda: {
    eyes: 'happy',
    nose: 'default',
  },
  ovalada: {
    eyes: 'default',
    nose: 'default',
  },
  cuadrada: {
    eyes: 'squint',
    nose: 'default',
  },
};

const HAIR_COLOR = {
  castanio: '724133',
  negro: '2c1b18',
  rubio: 'd6b370',
  rojo: 'a55728',
};

const EXPRESSION = {
  feliz: 'smile',
  tranquilo: 'twinkle',
  concentrado: 'serious',
};

const SHIRT_COLOR = {
  'shirt-blue': '65c9ff',
  'shirt-red': 'ff5c5c',
  'shirt-green': '3c4f5c',
  'shirt-purple': '9292ff',
  'shirt-rainbow': 'ffafb9',
};

const BACKGROUND_COLOR = {
  'bg-default': 'f6f7f9',
  'bg-stars': '262e57',
  'bg-beach': 'b6e3f4',
  'bg-forest': 'c0f2c7',
  'bg-space': '1b2440',
};

function parseAvatarJson(raw) {
  if (!raw) return { appearance: DEFAULT_APPEARANCE, equipped: DEFAULT_EQUIPPED };

  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return {
      appearance: {
        ...DEFAULT_APPEARANCE,
        ...(parsed?.appearance || parsed || {}),
      },
      equipped: {
        ...DEFAULT_EQUIPPED,
        ...(parsed?.equipped || {}),
      },
    };
  } catch {
    return { appearance: DEFAULT_APPEARANCE, equipped: DEFAULT_EQUIPPED };
  }
}

function buildDiceBearPngUrl(entity) {
  if (entity?.avatar_imagen_origen_url) return entity.avatar_imagen_origen_url;

  const { appearance, equipped } = parseAvatarJson(entity?.avatar_json);
  const options = {
    seed: `perteneciente-${entity?.id_perteneciente || entity?.id || 'avatar'}`,
    radius: '18',
    scale: '110',
    size: '512',
    backgroundType: 'solid',
    backgroundColor: BACKGROUND_COLOR[equipped.fondo || 'bg-default'] || BACKGROUND_COLOR['bg-default'],
    skinColor: SKIN_COLOR[appearance.colorPiel],
    top: HAIR_STYLE[appearance.peinado],
    hairColor: HAIR_COLOR[appearance.colorPelo],
    clothesColor: SHIRT_COLOR[equipped.ropa || 'shirt-blue'] || SHIRT_COLOR['shirt-blue'],
    clothing: 'hoodie',
    mouth: EXPRESSION[appearance.expresion],
    accessoriesColor: '25557c',
    facialHairColor: HAIR_COLOR[appearance.colorPelo],
    ...(GENDER_PRESET[appearance.genero] || GENDER_PRESET.neutral),
    ...(FACE_PRESET[appearance.formaCara] || FACE_PRESET.redonda),
  };

  if (equipped.accesorio === 'acc-glasses') {
    options.accessories = 'prescription02';
  }

  return `${envConfig.dicebearAvatarPngBaseUrl}?${new URLSearchParams(options).toString()}`;
}

function isConfigured() {
  return Boolean(envConfig.supabaseUrl && envConfig.supabaseServiceRoleKey && envConfig.supabaseAvatarBucket);
}

function getPublicUrl(path) {
  return `${envConfig.supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/${envConfig.supabaseAvatarBucket}/${path}`;
}

export default class AvatarImageStorageService {
  cacheAvatarImageAsync = async (entity) => {
    if (!isConfigured()) return null;

    const sourceUrl = buildDiceBearPngUrl(entity);
    const imageResponse = await axios.get(sourceUrl, {
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: {
        Accept: 'image/png,image/jpeg,image/*',
      },
    });

    const contentType = imageResponse.headers?.['content-type'] || 'image/png';
    if (!String(contentType).startsWith('image/')) {
      throw new Error(`La URL del avatar no devolvio una imagen valida: ${contentType}`);
    }

    const extension = contentType.includes('jpeg') || contentType.includes('jpg') ? 'jpg' : 'png';
    const avatarId = entity?.id || 'nuevo';
    const pertenecienteId = entity?.id_perteneciente || 'sin-perteneciente';
    const path = `pertenecientes/${pertenecienteId}/avatar-${avatarId}.${extension}`;

    await axios.put(
      `${envConfig.supabaseUrl.replace(/\/$/, '')}/storage/v1/object/${envConfig.supabaseAvatarBucket}/${path}`,
      Buffer.from(imageResponse.data),
      {
        timeout: 30000,
        headers: {
          apikey: envConfig.supabaseServiceRoleKey,
          Authorization: `Bearer ${envConfig.supabaseServiceRoleKey}`,
          'Content-Type': contentType,
          'x-upsert': 'true',
        },
      },
    );

    return {
      url: getPublicUrl(path),
      path,
      contentType,
      sourceUrl,
    };
  };
}
