import PictogramaService from '../src/services/PictogramaService.js';

const service = new PictogramaService();
const language = process.argv[2] || process.env.PICTOGRAM_SYNC_LANGUAGE || 'es';

try {
  const result = await service.syncFromArasaacAsync({ language });
  console.log(`Sincronizacion completa: ${result.saved}/${result.fetched} pictogramas guardados (${result.language}).`);
  process.exit(0);
} catch (error) {
  console.error('No se pudo sincronizar pictogramas:', error.message);
  process.exit(1);
}
