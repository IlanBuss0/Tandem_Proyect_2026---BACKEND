export default class BaseCrudService {
  constructor(repository, repositoryKey) {
    this.repositoryKey = repositoryKey;
    this[repositoryKey] = repository;
  }

  getAllAsync = async () => {
    const result = await this[this.repositoryKey].getAllAsync();
    return result ?? null;
  };
  getByIdAsync = async (id) => this[this.repositoryKey].getByIdAsync(id);
  createAsync = async (entity) => this[this.repositoryKey].createAsync(entity);
  updateAsync = async (entity) => this[this.repositoryKey].updateAsync(entity);
  deleteByIdAsync = async (id) => this[this.repositoryKey].deleteByIdAsync(id);
}
