import sharp from 'sharp';

const IMAGE_MIMES = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']);

export function isImageMime(contentType) {
  return IMAGE_MIMES.has(String(contentType || '').toLowerCase());
}

export async function compressImageAsync(buffer, {
  maxDimension = 1280,
  quality = 78,
  format = 'webp',
} = {}) {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw new Error('buffer debe ser un Buffer no vacio.');
  }

  const image = sharp(buffer, { animated: false }).rotate().resize({
    width: maxDimension,
    height: maxDimension,
    fit: 'inside',
    withoutEnlargement: true,
  });

  if (format === 'jpeg' || format === 'jpg') {
    return {
      buffer: await image.jpeg({ quality, mozjpeg: true }).toBuffer(),
      contentType: 'image/jpeg',
      extension: 'jpg',
    };
  }

  return {
    buffer: await image.webp({ quality }).toBuffer(),
    contentType: 'image/webp',
    extension: 'webp',
  };
}
