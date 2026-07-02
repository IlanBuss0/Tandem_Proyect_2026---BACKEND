import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCalendarReminderEntries, buildReminderEntries } from '../src/services/RoutineReminderService.js';

test('programa 10 y 5 minutos antes en la zona horaria del usuario', () => {
  const routines = [{ id: 'r1', date: '02/07/2026', dayOfWeek: null, items: [{
    id: 'i1', title: 'Preparar mochila', time: '15:00', completed: false, reminders: [-10, -5, 0],
  }] }];
  const entries = buildReminderEntries(routines, 'America/Argentina/Buenos_Aires', new Date('2026-07-02T12:00:00.000Z'));
  assert.deepEqual(entries.map(entry => entry.scheduledAt.toISOString()), [
    '2026-07-02T17:50:00.000Z', '2026-07-02T17:55:00.000Z', '2026-07-02T18:00:00.000Z',
  ]);
});

test('no programa avisos para pasos completados', () => {
  const routines = [{ id: 'r1', date: '02/07/2026', items: [{ id: 'i1', time: '15:00', completed: true, reminders: [-5] }] }];
  assert.equal(buildReminderEntries(routines, 'America/Argentina/Buenos_Aires', new Date('2026-07-02T12:00:00.000Z')).length, 0);
});

test('programa recordatorios de calendario para cualquier usuario', () => {
  const entries = buildCalendarReminderEntries([{
    id: 'event-1', title: 'Consulta médica', date: '2026-07-02', time: '15:00', reminders: [-10, -5],
  }], 'America/Argentina/Buenos_Aires', new Date('2026-07-02T12:00:00.000Z'));
  assert.deepEqual(entries.map(entry => ({ id: entry.eventId, at: entry.scheduledAt.toISOString() })), [
    { id: 'event-1', at: '2026-07-02T17:50:00.000Z' },
    { id: 'event-1', at: '2026-07-02T17:55:00.000Z' },
  ]);
});
