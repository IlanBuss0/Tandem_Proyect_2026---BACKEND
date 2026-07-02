import RoutineReminderRepository from '../repositories/RoutineReminderRepository.js';

const OFFSETS = new Set([-60, -30, -15, -10, -5, 0, 5, 10, 15]);
const DEFAULT_TIME_ZONE = 'America/Argentina/Buenos_Aires';

function validTimeZone(timeZone) {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone }).format();
    return true;
  } catch {
    return false;
  }
}

function partsInZone(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }).formatToParts(date);
  return Object.fromEntries(parts.map(part => [part.type, part.value]));
}

function localDateTimeToUtc(date, time, timeZone) {
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  const desiredUtc = Date.UTC(year, month - 1, day, hour, minute, 0);
  let result = desiredUtc;
  for (let pass = 0; pass < 2; pass += 1) {
    const parts = partsInZone(new Date(result), timeZone);
    const representedUtc = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), Number(parts.hour), Number(parts.minute), Number(parts.second));
    result += desiredUtc - representedUtc;
  }
  return new Date(result);
}

function datesFor(routine, timeZone, now) {
  if (Number.isInteger(routine.dayOfWeek) && routine.dayOfWeek >= 0 && routine.dayOfWeek <= 6) {
    const dates = [];
    const start = partsInZone(now, timeZone);
    const cursor = new Date(Date.UTC(Number(start.year), Number(start.month) - 1, Number(start.day)));
    for (let i = 0; i < 60; i += 1) {
      const candidate = new Date(cursor.getTime() + i * 86_400_000);
      if (candidate.getUTCDay() === routine.dayOfWeek) dates.push(candidate.toISOString().slice(0, 10));
    }
    return dates;
  }
  const match = String(routine.date || '').match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return match ? [`${match[3]}-${match[2]}-${match[1]}`] : [];
}

export function buildReminderEntries(routines, requestedTimeZone, now = new Date()) {
  if (!Array.isArray(routines)) throw new Error('Las rutinas son invalidas.');
  const timeZone = validTimeZone(requestedTimeZone) ? requestedTimeZone : DEFAULT_TIME_ZONE;
  const entries = [];
  for (const routine of routines) {
    for (const item of Array.isArray(routine.items) ? routine.items : []) {
      if (item.completed || !/^\d{2}:\d{2}$/.test(String(item.time))) continue;
      const offsets = [...new Set(Array.isArray(item.reminders) ? item.reminders.map(Number) : [])].filter(offset => OFFSETS.has(offset));
      for (const date of datesFor(routine, timeZone, now)) {
        const occurrenceAt = localDateTimeToUtc(date, item.time, timeZone);
        for (const offsetMinutes of offsets) {
          const scheduledAt = new Date(occurrenceAt.getTime() + offsetMinutes * 60_000);
          if (scheduledAt.getTime() >= now.getTime() - 86_400_000) entries.push({
            routineId: String(routine.id), itemId: String(item.id),
            title: String(item.title || 'Recordatorio'), occurrenceAt, offsetMinutes, scheduledAt,
          });
        }
      }
    }
  }
  return entries;
}

export function buildCalendarReminderEntries(events, requestedTimeZone, now = new Date()) {
  if (!Array.isArray(events)) throw new Error('Los eventos son invalidos.');
  const timeZone = validTimeZone(requestedTimeZone) ? requestedTimeZone : DEFAULT_TIME_ZONE;
  const entries = [];
  for (const event of events) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(event.date)) || !/^\d{2}:\d{2}$/.test(String(event.time))) continue;
    const offsets = [...new Set(Array.isArray(event.reminders) ? event.reminders.map(Number) : [])].filter(offset => OFFSETS.has(offset));
    const occurrenceAt = localDateTimeToUtc(event.date, event.time, timeZone);
    for (const offsetMinutes of offsets) {
      const scheduledAt = new Date(occurrenceAt.getTime() + offsetMinutes * 60_000);
      if (scheduledAt.getTime() >= now.getTime() - 86_400_000) entries.push({
        eventId: String(event.id), title: String(event.title || 'Recordatorio de calendario'),
        occurrenceAt, offsetMinutes, scheduledAt,
      });
    }
  }
  return entries;
}

export default class RoutineReminderService {
  constructor() { this.repository = new RoutineReminderRepository(); }
  syncAsync = async (userId, routines, timeZone) => this.repository.replaceForUserAsync(userId, buildReminderEntries(routines, timeZone));
  syncCalendarAsync = async (userId, events, timeZone) => this.repository.replaceCalendarForUserAsync(userId, buildCalendarReminderEntries(events, timeZone));
  cancelItemAsync = (userId, itemId) => this.repository.cancelItemAsync(userId, String(itemId));
}
