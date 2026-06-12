import AvatarRepository from '../src/repositories/AvatarRepository.js';
import AvatarImageStorageService from '../src/services/AvatarImageStorageService.js';

const repository = new AvatarRepository();
const storageService = new AvatarImageStorageService();

try {
  const avatars = await repository.getAllAsync();
  let cached = 0;
  let skipped = 0;

  for (const avatar of avatars) {
    const imageData = await storageService.cacheAvatarImageAsync(avatar);
    if (!imageData) {
      skipped += 1;
      continue;
    }

    await repository.updateAvatarImageAsync(avatar.id, imageData);
    cached += 1;
  }

  console.log(`Cache de avatares finalizado. Cacheados: ${cached}. Omitidos: ${skipped}.`);
  process.exit(0);
} catch (error) {
  console.error('No se pudo cachear los avatares existentes:', error.message);
  process.exit(1);
}
