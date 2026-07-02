import BD from '../db/BD.js';
export default class RoutineReminderRepository {
  replaceForUserAsync = (userId, entries) => BD.transaction(async client => {
    await client.query(`DELETE FROM recordatorios_programados WHERE id_usuario=$1 AND source_type='routine' AND status='pending'`,[userId]);
    for(const e of entries) await client.query(`INSERT INTO recordatorios_programados(id_usuario,source_type,routine_id,item_id,titulo,occurrence_at,offset_minutes,scheduled_at) VALUES($1,'routine',$2,$3,$4,$5,$6,$7) ON CONFLICT(id_usuario,source_type,item_id,occurrence_at,offset_minutes) DO UPDATE SET routine_id=EXCLUDED.routine_id,titulo=EXCLUDED.titulo,scheduled_at=EXCLUDED.scheduled_at`,[userId,e.routineId,e.itemId,e.title,e.occurrenceAt,e.offsetMinutes,e.scheduledAt]);
    return entries.length;
  });
  replaceCalendarForUserAsync = (userId, entries) => BD.transaction(async client => {
    await client.query(`DELETE FROM recordatorios_programados WHERE id_usuario=$1 AND source_type='calendar' AND status='pending'`,[userId]);
    for(const e of entries) await client.query(`INSERT INTO recordatorios_programados(id_usuario,source_type,routine_id,item_id,titulo,occurrence_at,offset_minutes,scheduled_at) VALUES($1,'calendar',$2,$2,$3,$4,$5,$6) ON CONFLICT(id_usuario,source_type,item_id,occurrence_at,offset_minutes) DO UPDATE SET titulo=EXCLUDED.titulo,scheduled_at=EXCLUDED.scheduled_at`,[userId,e.eventId,e.title,e.occurrenceAt,e.offsetMinutes,e.scheduledAt]);
    return entries.length;
  });
  cancelItemAsync=(userId,itemId)=>BD.execute(`UPDATE recordatorios_programados SET status='cancelled',processed_at=NOW() WHERE id_usuario=$1 AND item_id=$2 AND status='pending'`,[userId,itemId]);
  claimDueAsync=(limit=100)=>BD.transaction(async client=>{const r=await client.query(`WITH due AS(SELECT id FROM recordatorios_programados WHERE status='pending' AND scheduled_at<=NOW() AND scheduled_at>=NOW()-INTERVAL '24 hours' ORDER BY scheduled_at LIMIT $1 FOR UPDATE SKIP LOCKED) UPDATE recordatorios_programados r SET status='processing' FROM due WHERE r.id=due.id RETURNING r.*`,[limit]);await client.query(`UPDATE recordatorios_programados SET status='expired',processed_at=NOW() WHERE status='pending' AND scheduled_at<NOW()-INTERVAL '24 hours'`);return r.rows;});
  finishAsync=(id,status)=>BD.execute(`UPDATE recordatorios_programados SET status=$2,processed_at=NOW() WHERE id=$1`,[id,status]);
}
