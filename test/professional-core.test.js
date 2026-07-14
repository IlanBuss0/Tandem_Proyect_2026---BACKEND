import test from 'node:test';
import assert from 'node:assert/strict';
import SesionProfesionalService from '../src/services/SesionProfesionalService.js';
import PerfilProfesionalService from '../src/services/PerfilProfesionalService.js';

test('una nota privada no puede ser leida por otro profesional', async () => {
  const service = new SesionProfesionalService();
  service.SesionProfesionalRepository = {
    getByIdAsync: async () => ({ id: 7, id_profesional: 10 }),
  };
  await assert.rejects(() => service.getPrivateNoteAsync(7, 11), error => error.statusCode === 403);
});

test('el contenido de la nota exige documento JSON valido', async () => {
  const service = new SesionProfesionalService();
  service.SesionProfesionalRepository = { getByIdAsync: async () => ({ id: 7, id_profesional: 10 }) };
  await assert.rejects(() => service.savePrivateNoteAsync(7, 10, { type: 'html' }), error => error.statusCode === 400);
});

test('Drive deriva una URL de Google Docs y no confia en la URL recibida', async () => {
  const service = new SesionProfesionalService();
  let saved;
  service.getPrivateNoteAsync = async () => ({ id: 3 });
  service.SesionProfesionalRepository = {
    upsertDriveDocumentAsync: async (_id, document) => { saved = document; return document; },
  };
  await service.linkDriveDocumentAsync(7, 10, {
    google_file_id: 'AbCdEfGhIjKlMnOp', nombre: 'Ficha', web_view_url: 'https://evil.example',
  });
  assert.equal(saved.web_view_url, 'https://docs.google.com/document/d/AbCdEfGhIjKlMnOp/edit');
  assert.equal(saved.mime_type, 'application/vnd.google-apps.document');
});

test('el perfil no publica contactos con formato invalido', async () => {
  const service = new PerfilProfesionalService();
  await assert.rejects(
    () => service.saveMineAsync(2, { publicar_correo: true, correo_contacto: 'incorrecto' }),
    error => error.statusCode === 400,
  );
  await assert.rejects(
    () => service.saveMineAsync(2, { publicar_whatsapp: true, whatsapp_contacto: '123' }),
    error => error.statusCode === 400,
  );
});
