import BaseCrudRepository from './BaseCrudRepository.js';
import BD from '../db/BD.js';

class ChatRepository extends BaseCrudRepository {
  constructor() { super('chats', { softDelete: { field: 'activo' } }); }
  findMensajes(idChat) { return BD.query('SELECT * FROM mensajes WHERE id_chat = $1 ORDER BY id ASC', [idChat]); }
  createMensaje(idChat, body) { const e = Object.entries({ ...body, id_chat: idChat }).filter(([, v]) => v !== undefined); const f = e.map(([k]) => k); const vals = e.map(([, v]) => v); return BD.queryOne(`INSERT INTO mensajes (${f.join(', ')}) VALUES (${f.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING *`, vals); }
  updateMensaje(id, body) { const e = Object.entries(body).filter(([, v]) => v !== undefined); const sets = e.map(([k], i) => `${k} = $${i + 1}`); const vals = e.map(([, v]) => v); if (!vals.length) return BD.queryOne('SELECT * FROM mensajes WHERE id = $1', [id]); return BD.queryOne(`UPDATE mensajes SET ${sets.join(', ')} WHERE id = $${vals.length + 1} RETURNING *`, [...vals, id]); }
  async removeMensaje(id) { const deleted = await BD.queryOne('DELETE FROM mensajes WHERE id = $1 RETURNING id', [id]); return Boolean(deleted); }
  findConversacionesByUsuario(idUsuario) { return BD.query('SELECT c.* FROM chats c JOIN participantes_chats pc ON pc.id_chat = c.id WHERE pc.id_usuario = $1 ORDER BY c.id DESC', [idUsuario]); }
class ChatRepository extends BaseCrudRepository {
  constructor() { super('conversaciones'); }
  findMensajes(idConversacion) { return BD.query('SELECT * FROM mensajes WHERE id_conversacion = $1 ORDER BY id ASC', [idConversacion]); }
  createMensaje(idConversacion, body) { const e=Object.entries({...body,id_conversacion:idConversacion}).filter(([,v])=>v!==undefined); const f=e.map(([k])=>k); const vals=e.map(([,v])=>v); return BD.queryOne(`INSERT INTO mensajes (${f.join(', ')}) VALUES (${f.map((_,i)=>`$${i+1}`).join(', ')}) RETURNING *`, vals); }
  updateMensaje(id, body) { const e=Object.entries(body).filter(([,v])=>v!==undefined); const sets=e.map(([k],i)=>`${k} = $${i+1}`); const vals=e.map(([,v])=>v); return BD.queryOne(`UPDATE mensajes SET ${sets.join(', ')} WHERE id = $${vals.length+1} RETURNING *`, [...vals,id]); }
  removeMensaje(id) { return BD.execute('DELETE FROM mensajes WHERE id = $1', [id]); }
  findConversacionesByUsuario(idUsuario) { return BD.query('SELECT * FROM conversaciones WHERE id_usuario_1 = $1 OR id_usuario_2 = $1 ORDER BY id DESC', [idUsuario]); }
}
export default new ChatRepository();
