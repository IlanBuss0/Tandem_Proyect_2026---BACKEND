import PerfilProfesionalRepository from '../repositories/PerfilProfesionalRepository.js';

export default class PerfilProfesionalService {
  constructor() {
    this.repository = new PerfilProfesionalRepository();
  }

  getMineAsync = (idProfessional) => this.repository.getByProfessionalIdAsync(idProfessional);
  getDirectoryAsync = () => this.repository.getDirectoryAsync();

  saveMineAsync = async (idProfessional, data = {}) => {
    const email = String(data.correo_contacto || '').trim().toLowerCase();
    const whatsapp = String(data.whatsapp_contacto || '').replace(/[^\d+]/g, '');
    if (data.publicar_correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      const error = new Error('Ingresa un correo de contacto valido.');
      error.statusCode = 400;
      throw error;
    }
    if (data.publicar_whatsapp && !/^\+?[1-9]\d{7,14}$/.test(whatsapp)) {
      const error = new Error('Ingresa un WhatsApp en formato internacional.');
      error.statusCode = 400;
      throw error;
    }
    return this.repository.upsertForProfessionalAsync(idProfessional, {
      descripcion: String(data.descripcion || '').trim().slice(0, 2000) || null,
      experiencia: String(data.experiencia || '').trim().slice(0, 1000) || null,
      precio_sesion: data.precio_sesion === '' || data.precio_sesion == null ? null : Number(data.precio_sesion),
      informacion_precio: String(data.informacion_precio || '').trim().slice(0, 500) || null,
      visible_en_tienda: Boolean(data.visible_en_tienda),
      modalidad: String(data.modalidad || '').trim().slice(0, 80) || null,
      disponibilidad: String(data.disponibilidad || '').trim().slice(0, 255) || null,
      correo_contacto: email || null,
      whatsapp_contacto: whatsapp || null,
      publicar_correo: Boolean(data.publicar_correo),
      publicar_whatsapp: Boolean(data.publicar_whatsapp),
    });
  };
}
