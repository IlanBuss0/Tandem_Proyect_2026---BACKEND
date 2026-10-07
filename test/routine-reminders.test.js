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

test('no programa avisos para un paso completado en la fecha de la rutina', () => {
  const routines = [{ id: 'r1', date: '02/07/2026', items: [{ id: 'i1', time: '15:00', completed: true, completedOn: '2026-07-02', reminders: [-5] }] }];
  assert.equal(buildReminderEntries(routines, 'America/Argentina/Buenos_Aires', new Date('2026-07-02T12:00:00.000Z')).length, 0);
});

// 2026-07-02 es jueves (dayOfWeek 4): la rutina semanal se repite los jueves.
const weekly = (item) => [{ id: 'r1', dayOfWeek: 4, items: [{ id: 'i1', time: '15:00', reminders: [-5], ...item }] }];
const dayOf = (entry) => entry.occurrenceAt.toISOString().slice(0, 10);
const now = new Date('2026-07-02T12:00:00.000Z');

test('paso completado hoy: no hay recordatorio de hoy pero sí del mismo día de la semana que viene', () => {
  const entries = buildReminderEntries(weekly({ completed: true, completedOn: '2026-07-02' }), 'America/Argentina/Buenos_Aires', now);
  const days = entries.map(dayOf);
  assert.ok(!days.includes('2026-07-02'));
  assert.ok(days.includes('2026-07-09'));
  assert.ok(days.includes('2026-07-16'));
});

test('paso completado sin fecha (dato viejo): recordatorios normales, no salta nada', () => {
  const entries = buildReminderEntries(weekly({ completed: true }), 'America/Argentina/Buenos_Aires', now);
  assert.ok(entries.map(dayOf).includes('2026-07-02'));
  const invalid = buildReminderEntries(weekly({ completed: true, completedOn: 'ayer' }), 'America/Argentina/Buenos_Aires', now);
  assert.ok(invalid.map(dayOf).includes('2026-07-02'));
});

test('paso no completado: recordatorios normales aunque traiga una fecha vieja', () => {
  const entries = buildReminderEntries(weekly({ completed: false, completedOn: '2026-07-02' }), 'America/Argentina/Buenos_Aires', now);
  assert.ok(entries.map(dayOf).includes('2026-07-02'));
  assert.ok(entries.map(dayOf).includes('2026-07-09'));
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
