import PictogramaService from '../services/PictogramaService.js';

const DEFAULT_INTERVAL_DAYS = 30;

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function startPictogramaSyncJob() {
  if (process.env.PICTOGRAM_SYNC_ENABLED !== 'true') return null;

  const service = new PictogramaService();
  const language = process.env.PICTOGRAM_SYNC_LANGUAGE || 'es';
  const intervalDays = parsePositiveInt(process.env.PICTOGRAM_SYNC_INTERVAL_DAYS, DEFAULT_INTERVAL_DAYS);
  const intervalMs = intervalDays * 24 * 60 * 60 * 1000;

  const run = async () => {
    try {
      const result = await service.syncFromArasaacAsync({ language });
      console.log(`Pictogramas sincronizados: ${result.saved}/${result.fetched} (${result.language}).`);
    } catch (error) {
      console.error('Error sincronizando pictogramas:', error.message);
    }
  };

  const timer = setInterval(run, intervalMs);

  if (process.env.PICTOGRAM_SYNC_ON_START === 'true') {
    run();
  }

  console.log(`Sync mensual de pictogramas activo cada ${intervalDays} dias.`);
  return timer;
}
