import RoutineReminderRepository from '../repositories/RoutineReminderRepository.js';
const OFFSETS=new Set([-60,-30,-15,-10,-5,0,5,10,15]);
function datesFor(r){if(Number.isInteger(r.dayOfWeek)&&r.dayOfWeek>=0&&r.dayOfWeek<=6){const a=[];for(let i=0;i<60;i++){const d=new Date(Date.now()+i*86400000);if(d.getDay()===r.dayOfWeek)a.push(d.toISOString().slice(0,10));}return a;}const m=String(r.date||'').match(/^(\d{2})\/(\d{2})\/(\d{4})$/);return m?[`${m[3]}-${m[2]}-${m[1]}`]:[];}
export default class RoutineReminderService {
  constructor(){this.repository=new RoutineReminderRepository();}
  syncAsync=async(userId,routines)=>{if(!Array.isArray(routines))throw new Error('Las rutinas son invalidas.');const entries=[];for(const r of routines)for(const item of Array.isArray(r.items)?r.items:[]){if(item.completed||!/^\d{2}:\d{2}$/.test(String(item.time)))continue;const offsets=[...new Set(Array.isArray(item.reminders)?item.reminders.map(Number):[])].filter(x=>OFFSETS.has(x));for(const date of datesFor(r)){const occurrenceAt=new Date(`${date}T${item.time}:00-03:00`);if(Number.isNaN(occurrenceAt.getTime()))continue;for(const offsetMinutes of offsets){const scheduledAt=new Date(occurrenceAt.getTime()+offsetMinutes*60000);if(scheduledAt.getTime()>=Date.now()-86400000)entries.push({routineId:String(r.id),itemId:String(item.id),title:String(item.title||'Recordatorio'),occurrenceAt,offsetMinutes,scheduledAt});}}}return this.repository.replaceForUserAsync(userId,entries);};
  cancelItemAsync=(userId,itemId)=>this.repository.cancelItemAsync(userId,String(itemId));
}
