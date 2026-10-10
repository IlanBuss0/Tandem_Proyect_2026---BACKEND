export default class CatalogEntity {
  constructor({ id = null, nombre, orden }) {
    this.id = id;
    this.nombre = nombre;
    this.orden = orden;
  }
}
