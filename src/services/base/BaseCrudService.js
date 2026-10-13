import CatalogRepository from '../../repositories/base/CatalogRepository.js';
import { buildCacheKey, getOrSetCache, invalidateCache } from '../../cache/cacheHelper.js';
import { CACHE_TAGS, CACHE_TTL } from '../../cache/cacheTags.js';

export default class BaseCrudService {
  constructor(repository, repositoryKey) {
    this.repositoryKey = repositoryKey;
    this[repositoryKey] = repository;
    // Catalogos globales (id, nombre, orden): no dependen del usuario, cambian
    // muy poco y los piden casi todas las pantallas. Se cachean con clave
    // global y se invalidan en cada alta/edicion/baja del mismo catalogo.
    this.catalogTable = repository instanceof CatalogRepository ? repository.table : null;
  }

  getAllAsync = async () => {
    if (this.catalogTable) {
      return await getOrSetCache(
        buildCacheKey(`catalog:${this.catalogTable}`),
        CACHE_TTL.CATALOG,
        async () => (await this[this.repositoryKey].getAllAsync()) ?? null,
        { tags: [CACHE_TAGS.catalog(this.catalogTable)] },
      );
    }
    const result = await this[this.repositoryKey].getAllAsync();
    return result ?? null;
  };
  getByIdAsync = async (id) => this[this.repositoryKey].getByIdAsync(id);
  createAsync = async (entity) => this.afterCatalogWrite(await this[this.repositoryKey].createAsync(entity));
  updateAsync = async (entity) => this.afterCatalogWrite(await this[this.repositoryKey].updateAsync(entity));
  deleteByIdAsync = async (id) => this.afterCatalogWrite(await this[this.repositoryKey].deleteByIdAsync(id));

  afterCatalogWrite = async (result) => {
    if (this.catalogTable) await invalidateCache({ tags: [CACHE_TAGS.catalog(this.catalogTable)] });
    return result;
  };
}
