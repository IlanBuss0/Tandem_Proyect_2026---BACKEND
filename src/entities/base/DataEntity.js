export default class DataEntity {
  constructor(data = {}) {
    Object.assign(this, { id: null }, data);
  }
}
