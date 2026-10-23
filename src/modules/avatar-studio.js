import { readFileSync } from 'node:fs';
import AppError from './errors/AppError.js';

export const studioCatalog = JSON.parse(readFileSync(new URL('../configs/avatar-wardrobe.json', import.meta.url), 'utf8'));
export const studioFreeCodes = studioCatalog.filter(item => item.price === 0).map(item => item.id);
const physical = { base: ['masculine', 'feminine'], skinTone: ['porcelain', 'warm', 'brown', 'deep'], hairColor: ['espresso', 'chestnut', 'honey', 'copper'], eyeColor: ['hazel', 'green', 'blue'] };
const equipmentCategories = ['hairstyle', 'top', 'bottom', 'shoes', 'accessory'];

export function assertStudioEquipment(parsed, ownedCodes) {
  const allowed = new Set([...studioFreeCodes, ...ownedCodes]);
  for (const item of studioCatalog) if (item.legacyIds.some(code => allowed.has(code))) allowed.add(item.id);
  for (const [key, options] of Object.entries(physical)) {
    // Configurations saved before bases existed keep the original body.
    const value = key === 'base' ? parsed.config?.base ?? 'masculine' : parsed.config?.[key];
    if (!options.includes(value)) throw new AppError('Caracteristica de avatar no valida.', 400);
  }
  for (const category of equipmentCategories) {
    const code = `${category}:${parsed.config?.[category]}`;
    const legacyFreeHair = category === 'hairstyle' && parsed.equipped?.hairstyle === undefined && studioFreeCodes.includes(code);
    if (!studioCatalog.some(item => item.id === code) || (!legacyFreeHair && parsed.equipped?.[category] !== code)) throw new AppError('Prenda o categoria de avatar no valida.', 400);
    if (!allowed.has(code)) throw new AppError('El avatar solo puede equipar articulos de su inventario.', 403);
  }
  if (Object.keys(parsed.equipped).some(key => !equipmentCategories.includes(key))) throw new AppError('Categoria no valida.', 400);
}
