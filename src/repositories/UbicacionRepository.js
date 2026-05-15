import BaseCrudRepository from './BaseCrudRepository.js';
import BD from '../db/BD.js';
class UbicacionRepository extends BaseCrudRepository {
  constructor() { super('ubicaciones_historiales'); }
  findByPerteneciente(id) { return BD.query('SELECT uh.* FROM ubicaciones_historiales uh JOIN dispositivos d ON d.id = uh.id_dispositivo JOIN pertenecientes p ON p.id_usuario = d.id_usuario WHERE p.id = $1 ORDER BY uh.id DESC', [id]); }
  findZonasByPerteneciente(id) { return BD.query('SELECT * FROM zonas_seguras WHERE id_perteneciente = $1 ORDER BY id DESC', [id]); }
  createZona(data) { const e = Object.entries(data).filter(([, v]) => v !== undefined); const f = e.map(([k]) => k); const vals = e.map(([, v]) => v); return BD.queryOne(`INSERT INTO zonas_seguras (${f.join(', ')}) VALUES (${f.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING *`, vals); }
  updateZona(id, data) { const e = Object.entries(data).filter(([, v]) => v !== undefined); const sets = e.map(([k], i) => `${k} = $${i + 1}`); const vals = e.map(([, v]) => v); return BD.queryOne(`UPDATE zonas_seguras SET ${sets.join(', ')} WHERE id = $${vals.length + 1} RETURNING *`, [...vals, id]); }
  async removeZona(id) { const row = await BD.queryOne('UPDATE zonas_seguras SET activa = false WHERE id = $1 RETURNING id', [id]); return Boolean(row); }
  constructor() { super('ubicaciones'); }
  findByPerteneciente(id) { return BD.query('SELECT * FROM ubicaciones WHERE id_perteneciente = $1 ORDER BY id DESC', [id]); }
  findZonasByPerteneciente(id) { return BD.query('SELECT * FROM zonas_seguras WHERE id_perteneciente = $1 ORDER BY id DESC', [id]); }
  createZona(data) {
    const e = Object.entries(data).filter(([,v])=>v!==undefined); const f=e.map(([k])=>k); const vals=e.map(([,v])=>v);
    return BD.queryOne(`INSERT INTO zonas_seguras (${f.join(', ')}) VALUES (${f.map((_,i)=>`$${i+1}`).join(', ')}) RETURNING *`, vals);
  }
  updateZona(id, data) {
    const e = Object.entries(data).filter(([,v])=>v!==undefined); const sets=e.map(([k],i)=>`${k} = $${i+1}`); const vals=e.map(([,v])=>v);
    return BD.queryOne(`UPDATE zonas_seguras SET ${sets.join(', ')} WHERE id = $${vals.length+1} RETURNING *`, [...vals,id]);
  }
  removeZona(id) { return BD.execute('DELETE FROM zonas_seguras WHERE id = $1', [id]); }
}
export default new UbicacionRepository();
