import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildDailyEvolutionReport, buildEvolutionReport, parseDaysParam, parseWeeksParam } from '../src/modules/usage/evolution.js';

function event(tipo, ocurridoEn, valor) {
  return { tipo_evento: tipo, ocurrido_en: ocurridoEn, valor };
}

test('buildEvolutionReport: sin eventos, devuelve lista vacia', () => {
  assert.deepEqual(buildEvolutionReport([]), []);
});

test('buildEvolutionReport: cuenta pasos completados por semana', () => {
  const events = [
    event('rutina_paso_completado', '2026-07-06T10:00:00.000Z'),
    event('rutina_paso_completado', '2026-07-07T10:00:00.000Z'),
    event('rutina_paso_completado', '2026-07-13T10:00:00.000Z'),
  ];
  const report = buildEvolutionReport(events);
  assert.equal(report.length, 2);
  assert.equal(report[0].routineCompletions, 2);
  assert.equal(report[1].routineCompletions, 1);
});

test('buildEvolutionReport: calcula proporcion positiva de emociones por semana', () => {
  const events = [
    event('emocion_registrada', '2026-07-06T10:00:00.000Z', { emotion: 'Contento' }),
    event('emocion_registrada', '2026-07-07T10:00:00.000Z', { emotion: 'Ansioso' }),
  ];
  const report = buildEvolutionReport(events);
  assert.equal(report.length, 1);
  assert.equal(report[0].positiveEmotionRatio, 0.5);
  assert.equal(report[0].emotionSampleSize, 2);
});

test('buildEvolutionReport: semana sin emociones relevantes tiene positiveEmotionRatio null', () => {
  const events = [event('rutina_paso_completado', '2026-07-06T10:00:00.000Z')];
  const report = buildEvolutionReport(events);
  assert.equal(report[0].positiveEmotionRatio, null);
  assert.equal(report[0].emotionSampleSize, 0);
});

test('buildEvolutionReport: ignora eventos con fecha invalida sin romper', () => {
  const events = [event('rutina_paso_completado', 'no-es-fecha'), event('rutina_paso_completado', '2026-07-06T10:00:00.000Z')];
  const report = buildEvolutionReport(events);
  assert.equal(report.length, 1);
  assert.equal(report[0].routineCompletions, 1);
});

test('buildEvolutionReport: recorta a las ultimas maxWeeks semanas', () => {
  const events = [
    event('rutina_paso_completado', '2026-01-06T10:00:00.000Z'),
    event('rutina_paso_completado', '2026-07-06T10:00:00.000Z'),
  ];
  const report = buildEvolutionReport(events, { maxWeeks: 1 });
  assert.equal(report.length, 1);
  assert.ok(report[0].week.startsWith('2026-W2') || report[0].week.startsWith('2026-W3'));
});

test('buildEvolutionReport: ordena semanas cronologicamente', () => {
  const events = [
    event('rutina_paso_completado', '2026-07-13T10:00:00.000Z'),
    event('rutina_paso_completado', '2026-07-06T10:00:00.000Z'),
  ];
  const report = buildEvolutionReport(events);
  assert.ok(report[0].week < report[1].week);
});

test('parseWeeksParam: sin valor, default 8', () => {
  assert.equal(parseWeeksParam(undefined), 8);
  assert.equal(parseWeeksParam(''), 8);
});

test('parseWeeksParam: 8, 13 y 52 son validos', () => {
  assert.equal(parseWeeksParam('8'), 8);
  assert.equal(parseWeeksParam('13'), 13);
  assert.equal(parseWeeksParam('52'), 52);
});

test('parseWeeksParam: texto invalido devuelve null', () => {
  assert.equal(parseWeeksParam('abc'), null);
});

test('parseWeeksParam: 0, negativo y otros numeros devuelven null', () => {
  assert.equal(parseWeeksParam('0'), null);
  assert.equal(parseWeeksParam('-1'), null);
  assert.equal(parseWeeksParam('9'), null);
  assert.equal(parseWeeksParam('99'), null);
});

test('parseDaysParam: solo 2 y 14 son validos, sin valor devuelve null', () => {
  assert.equal(parseDaysParam('2'), 2);
  assert.equal(parseDaysParam('14'), 14);
  assert.equal(parseDaysParam(undefined), null);
  assert.equal(parseDaysParam('7'), null);
  assert.equal(parseDaysParam('abc'), null);
});

test('buildDailyEvolutionReport: devuelve siempre N dias continuos terminando hoy, con ceros', () => {
  const now = new Date('2026-07-15T12:00:00.000Z');
  const report = buildDailyEvolutionReport([], 2, now);
  assert.deepEqual(report.map((row) => row.day), ['2026-07-14', '2026-07-15']);
  assert.equal(report[0].routineCompletions, 0);
  assert.equal(report[0].positiveEmotionRatio, null);
});

test('buildDailyEvolutionReport: cuenta pasos y emociones en su dia e ignora los de afuera', () => {
  const now = new Date('2026-07-15T12:00:00.000Z');
  const events = [
    event('rutina_paso_completado', '2026-07-15T09:00:00.000Z'),
    event('rutina_paso_completado', '2026-07-15T10:00:00.000Z'),
    event('rutina_paso_completado', '2026-07-14T10:00:00.000Z'),
    event('rutina_paso_completado', '2026-07-01T10:00:00.000Z'),
    event('emocion_registrada', '2026-07-14T11:00:00.000Z', { emotion: 'Contento' }),
    event('rutina_paso_completado', 'no-es-fecha'),
  ];
  const report = buildDailyEvolutionReport(events, 2, now);
  assert.equal(report[0].routineCompletions, 1);
  assert.equal(report[0].positiveEmotionRatio, 1);
  assert.equal(report[1].routineCompletions, 2);
});
